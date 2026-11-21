import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If token was passed via URL query parameter
  const queryToken = route.queryParams['token'];
  if (queryToken && !auth.isExpired(queryToken)) {
    auth.storeToken(queryToken);
    return true;
  }

  // If user is actively logged in and token is not expired
  if (auth.loggedIn() && !auth.isExpired()) {
    return true;
  }

  // Otherwise route to the Angular login page
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};