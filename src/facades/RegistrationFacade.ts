import { connectMongo } from '@/lib/mongodb';
import { Registration } from '@/models/Registration';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { RegistrationStateMachine } from '@/state-machines';
import { getEventPublisher } from '@/observers/EventPublisher';
import { AdapterFactory } from '@/factories';
import { RegistrationState, Semester } from '@/types';

export class RegistrationFacade {
  private paymentAdapter = AdapterFactory.createPaymentAdapter();
  private eventPublisher = getEventPublisher();

  async submitRegistration(studentId: string, semester: Semester, courseIds: string[]): Promise<any> {
    await connectMongo();

    // Get student info
    const student = await User.findOne({ userId: studentId });
    if (!student) throw new Error('Student not found');

    // Get advisor for the department
    const advisor = await User.findOne({ 
      departmentId: student.departmentId, 
      isAdvisor: true 
    });
    if (!advisor) throw new Error('No advisor found for department');

    // Create registration
    const registration = await Registration.create({
      studentId,
      semester,
      departmentId: student.departmentId,
      courseIds,
      state: 'submitted',
      advisorId: advisor.userId,
    });

    // Publish event
    await this.eventPublisher.publish({
      type: 'registration_submitted',
      data: {
        registrationId: registration._id,
        studentId,
        semester,
        advisorId: advisor.userId,
      },
      timestamp: new Date(),
    });

    return registration;
  }

  async approveByAdvisor(registrationId: string, advisorId: string): Promise<any> {
    await connectMongo();

    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error('Registration not found');

    // Check state transition
    const transition = RegistrationStateMachine.transition(
      registration.state, 
      'advisor_approved'
    );
    if (!transition.success) throw new Error(transition.error);

    // Update registration
    registration.state = 'advisor_approved';
    registration.advisorApprovedAt = new Date();
    await registration.save();

    // Get department head
    const head = await User.findOne({ 
      departmentId: registration.departmentId, 
      isDepartmentHead: true 
    });

    // Publish event
    await this.eventPublisher.publish({
      type: 'registration_advisor_approved',
      data: {
        registrationId: registration._id,
        studentId: registration.studentId,
        headId: head?.userId,
      },
      timestamp: new Date(),
    });

    return registration;
  }

  async rejectByAdvisor(registrationId: string, advisorId: string, reason: string): Promise<any> {
    await connectMongo();

    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error('Registration not found');

    const transition = RegistrationStateMachine.transition(
      registration.state, 
      'advisor_rejected'
    );
    if (!transition.success) throw new Error(transition.error);

    registration.state = 'advisor_rejected';
    registration.advisorRejectionReason = reason;
    await registration.save();

    await this.eventPublisher.publish({
      type: 'registration_advisor_rejected',
      data: {
        registrationId: registration._id,
        studentId: registration.studentId,
        reason,
      },
      timestamp: new Date(),
    });

    return registration;
  }

  async approveByHead(registrationId: string, headId: string): Promise<any> {
    await connectMongo();

    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error('Registration not found');

    const transition = RegistrationStateMachine.transition(
      registration.state, 
      'head_approved'
    );
    if (!transition.success) throw new Error(transition.error);

    // Transition through payment_pending immediately
    registration.state = 'payment_pending';
    registration.headApprovedAt = new Date();
    await registration.save();

    await this.eventPublisher.publish({
      type: 'registration_head_approved',
      data: {
        registrationId: registration._id,
        studentId: registration.studentId,
      },
      timestamp: new Date(),
    });

    return registration;
  }

  async initiatePayment(registrationId: string, studentId: string): Promise<any> {
    await connectMongo();

    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error('Registration not found');
    if (registration.state !== 'payment_pending') {
      throw new Error('Payment not ready');
    }

    // Calculate payment amount (simplified)
    const courses = await Course.find({ _id: { $in: registration.courseIds } });
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const amount = totalCredits * 5000; // 5000 per credit

    // Initiate payment
    const paymentResult = await this.paymentAdapter.initiatePayment({
      amount,
      studentId,
      registrationId: registrationId.toString(),
      description: `Registration for ${registration.semester}`,
    });

    registration.paymentId = paymentResult.paymentId;
    await registration.save();

    return {
      registration,
      payment: paymentResult,
    };
  }

  async completePayment(registrationId: string, paymentId: string): Promise<any> {
    await connectMongo();

    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error('Registration not found');

    // Verify payment
    const paymentStatus = await this.paymentAdapter.verifyPayment(paymentId);
    if (paymentStatus.status !== 'completed') {
      throw new Error('Payment not completed');
    }

    const transition = RegistrationStateMachine.transition(
      registration.state, 
      'payment_completed'
    );
    if (!transition.success) throw new Error(transition.error);

    registration.state = 'payment_completed';
    registration.paidAt = new Date();
    await registration.save();

    return registration;
  }

  async admitStudent(registrationId: string, adminId: string): Promise<any> {
    await connectMongo();

    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error('Registration not found');

    const transition = RegistrationStateMachine.transition(
      registration.state, 
      'admitted'
    );
    if (!transition.success) throw new Error(transition.error);

    registration.state = 'admitted';
    registration.admittedAt = new Date();
    await registration.save();

    // Update student's current semester
    await User.findOneAndUpdate(
      { userId: registration.studentId },
      { currentSemester: registration.semester }
    );

    await this.eventPublisher.publish({
      type: 'registration_admitted',
      data: {
        registrationId: registration._id,
        studentId: registration.studentId,
        semester: registration.semester,
      },
      timestamp: new Date(),
    });

    return registration;
  }

  async getRegistrationsByStudent(studentId: string): Promise<any[]> {
    await connectMongo();
    return Registration.find({ studentId }).sort({ createdAt: -1 });
  }

  async getPendingApprovals(advisorId?: string, departmentId?: string): Promise<any[]> {
    await connectMongo();

    const filter: any = { 
      state: { $in: ['submitted', 'advisor_approved'] } 
    };

    if (advisorId) {
      filter.advisorId = advisorId;
      filter.state = 'submitted';
    } else if (departmentId) {
      filter.departmentId = departmentId;
      filter.state = 'advisor_approved';
    }

    return Registration.find(filter).sort({ createdAt: 1 });
  }
}
