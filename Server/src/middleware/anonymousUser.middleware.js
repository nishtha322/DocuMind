// File: src/middleware/anonymousUser.middleware.js

import { randomUUID } from 'crypto';
import * as userRepository from '../repositories/user.repository.js';
import { catchAsync } from '../utils/catchAsync.js';
import { config } from '../config/env.js';

const COOKIE_NAME = 'documind_user';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function setUserCookie(res, userId) {
  res.cookie(COOKIE_NAME, userId, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    sameSite: config.isProduction ? 'none' : 'lax',
    secure: config.isProduction,
  });
}

// Identify the anonymous browser user via cookie, creating one if needed
export const anonymousUser = catchAsync(async (req, res, next) => {
  const cookieUserId = req.cookies?.[COOKIE_NAME];

  if (cookieUserId && UUID_REGEX.test(cookieUserId)) {
    const user = await userRepository.findUserById(cookieUserId);

    if (user) {
      req.userId = user.id;
      return next();
    }
  }

  const user = await userRepository.createAnonymousUser(
    `anonymous_${randomUUID()}@local`
  );

  setUserCookie(res, user.id);
  req.userId = user.id;
  next();
});
