import { Global, Module } from '@nestjs/common';
import { CryptoService } from './crypto.service.js';
import { TotpService } from './totp.service.js';

@Global()
@Module({
  providers: [CryptoService, TotpService],
  exports: [CryptoService, TotpService],
})
export class SecurityModule {}
