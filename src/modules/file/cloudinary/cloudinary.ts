import { Inject } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { config, configType } from 'src/common/config/config';

export class CloudinaryProvider {
  constructor(@Inject(config.KEY) private readonly configService: configType) {
    v2.config({
      cloud_name: this.configService.cloudinary.cloudName,
      api_key: this.configService.cloudinary.apiKey,
      api_secret: this.configService.cloudinary.apiSecret,
    });
  }
}
