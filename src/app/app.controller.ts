import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Main endpoint to track visits. This one needs to be improved to be more performant. */
  @Get()
  trackVisits() {
    return this.appService.trackVisits();
  }
}
