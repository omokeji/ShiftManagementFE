import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './signup.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { SignInDto } from './signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      // console.log(user)
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }
      
      const isPasswordValid = await bcrypt.compare(pass, user.password);
        // console.log(isPasswordValid)
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.isConfirmed) {
        throw new UnauthorizedException('Please confirm your email before logging in');
      }

      if (user.isDeleted) {
        throw new UnauthorizedException('This account has been deactivated');
      }

      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async login(signinDto: SignInDto) {
    try {
      const { email, password } = signinDto;
      const user = await this.validateUser(email, password);
      
      const payload = { 
        username: user.username, 
        email: user.email, 
        sub: user.id, 
        role: user.role 
      };

      return {
        access_token: this.jwtService.sign(payload),
        success: true,
        username: user.username,  
        message: 'Login successful',
        user: { 
          id: user.id,
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          phone: user.phone,
          title: user.title,
          employmentstartdate: user.employmentstartdate,
          employmentenddate: user.employmentenddate,
          lastlogin: user.lastlogin,
          team: user.team,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async signupuser(signupDto: SignUpDto) {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(signupDto.email);
      if (existingUser) {
        throw new BadRequestException('Email is already registered');
      }

      const hashedPassword = await bcrypt.hash(signupDto.password, 10);
      signupDto.role = 'user';
      signupDto.password = hashedPassword;
      
      const user = await this.usersService.createuser(signupDto);
      const payload = { 
        username: user.username, 
        email: user.email, 
        sub: user.id, 
        role: user.role 
      };

      return {
        access_token: this.jwtService.sign(payload),
        success: true,
        username: user.username,  
        message: `Account created successfully. Please check your email for confirmation.`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create account. Please try again.');
    }
  }

  async signupadmin(signupDto: CreateUserDto) {
    try {
      // Check if admin already exists
      const existingUser = await this.usersService.findByEmail(signupDto.email);
      if (existingUser) {
        throw new BadRequestException('Email is already registered');
      }

      const hashedPassword = await bcrypt.hash(signupDto.password, 10);
      signupDto.password = hashedPassword;
      
      const user = await this.usersService.createadmin(signupDto);
      const payload = { 
        username: user.username, 
        sub: user.id, 
        role: user.role 
      };

      return {
        access_token: this.jwtService.sign(payload),
        success: true,
        username: user.username,  
        message: `Administrator account created successfully`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create administrator account. Please try again.');
    }
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    try {
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      if (oldPassword === newPassword) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Add password strength validation if needed
      if (newPassword.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await this.usersService.update(userId, user);
      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to change password. Please try again.');
    }
  }

  async requestPasswordReset(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        // For security reasons, don't reveal if email exists
        return { message: 'If an account exists with this email, you will receive a password reset link.' };
      }

      if (user.isDeleted) {
        throw new BadRequestException('This account has been deactivated');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

      await this.usersService.update(user.id, user);
      await this.sendPasswordResetEmail(email, resetToken);

      return { message: 'If an account exists with this email, you will receive a password reset link.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to process password reset request. Please try again.');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const user = await this.usersService.findByResetToken(token);
      if (!user) {
        throw new BadRequestException('Invalid reset token');
      }

      if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }

      if (newPassword.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetToken = '';
      user.resetTokenExpiry = new Date(0); // Use epoch date instead of null/undefined
      await this.usersService.update(user.id, user);

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to reset password. Please try again.');
    }
  }

  async logOut(userId: number) {
    try {
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.lastlogin = new Date();
      await this.usersService.update(userId, user);
      return { message: 'Logged out successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to process logout. Please try again.');
    }
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    try {
      await this.mailService.sendPasswordResetEmail(email, token);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new BadRequestException('Failed to send password reset email. Please try again.');
    }
  }
}
