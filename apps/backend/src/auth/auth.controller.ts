import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SignupDto,
  LoginDto,
  AdminLoginDto,
  LoginByIdDto,
  CheckUserDto,
  RegisterUserDto,
  SetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Keep signup for admin to create users (protected)
  @UseGuards(JwtAuthGuard)
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  // Check if user exists (public)
  @Post('check-user')
  async checkUser(@Body() checkUserDto: CheckUserDto) {
    return this.authService.checkUser(checkUserDto);
  }

  // Register new user without password (public)
  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  // Set password for first-time user (public)
  @Post('set-password')
  async setPassword(@Body() setPasswordDto: SetPasswordDto) {
    return this.authService.setPassword(setPasswordDto);
  }

  // Get userId prefix for department (public)
  @Get('user-id-prefix/:department')
  async getUserIdPrefix(@Param('department') department: string) {
    return { prefix: this.authService.getUserIdPrefix(department) };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login-by-id')
  async loginById(@Body() loginByIdDto: LoginByIdDto) {
    return this.authService.loginById(loginByIdDto);
  }

  @Post('admin-login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginDto);
  }

  @Get('departments/:department/users')
  async getUsersByDepartment(@Param('department') department: string) {
    return this.authService.getUsersByDepartment(department);
  }

  @Get('search')
  async searchUsers(@Query('q') query: string) {
    return this.authService.searchUsersByUserId(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return req.user;
  }
}
