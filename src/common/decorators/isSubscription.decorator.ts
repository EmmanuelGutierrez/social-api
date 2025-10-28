import { SetMetadata } from '@nestjs/common';

export const IS_SUBSCRIPTION_KEY = 'isSubscription';
export const IsSubscription = () => SetMetadata(IS_SUBSCRIPTION_KEY, true);
