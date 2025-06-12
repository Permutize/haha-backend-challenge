import { Controller, Get } from "@nestjs/common";
import { CheckService } from "./check.service";

@Controller('check')
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  @Get()
  async check() {
    return await this.checkService.check();
  }
}