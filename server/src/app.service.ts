import { Injectable } from '@nestjs/common';
import { showMessage } from '../../securelib';

@Injectable()
export class AppService {
  getHello(): string {
    return showMessage();
  }
}
