import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user.dto';

@ApiTags('users') // Swagger kategória
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOkResponse({ type: [UserResponseDto] })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }
}
