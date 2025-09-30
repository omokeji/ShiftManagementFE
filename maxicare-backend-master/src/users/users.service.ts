import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignUpDto } from 'src/auth/signup.dto';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  async createadmin(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    await this.sendConfirmationEmail(savedUser.email, confirmationToken);

    return savedUser;
  }

  async createuser(createUserDto: SignUpDto): Promise<User> {
    createUserDto.role = 'user';
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    await this.mailService.sendWelcomeEmail(savedUser.email, savedUser.username);
    await this.sendConfirmationEmail(savedUser.email, confirmationToken);

    return savedUser;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new Error(`User with username ${username} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findByResetToken(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { resetToken: token } });
    if (!user) {
      throw new Error(`User with reset token ${token} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    return user;
  }
  
  async confirmEmail(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { confirmationToken: token } });
    if (!user) throw new BadRequestException('Invalid token');
    user.isConfirmed = true;
    user.confirmationToken = token;
    return this.usersRepository.save(user);
  }

  async sendConfirmationEmail(email: string, token: string) {
    try {
      const html = `
        <h2>Confirm Your Email</h2>
        <p>Please click the button below to confirm your email address:</p>
        <a href="${process.env.APP_URL}/auth/confirm?token=${token}" 
           style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block;">
          Confirm Email
        </a>
        <p>If you didn't create an account, please ignore this email.</p>
      `;
      
      await this.mailService.sendMail(email, 'Confirm Your Email', html);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw new BadRequestException('Failed to send confirmation email. Please try again.');
    }
  }
}