import React from 'react';
import { Switch, Route, Redirect as ReactRouterRedirect, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useKeycloak } from '@react-keycloak/web';

import { Login } from './pages/Login';
import { ActivateUser } from './pages/ActivateUser';
import { PROTECTED_ROUTES } from './common/components/navigationBar/ProtectedRoutes';
import { NavigationBar } from './common/components/navigationBar/NavigationBar';
import { getUserToken, getUsername } from './store/slices';
import { useGetUserAporTypes } from './common/hooks';
import PageSpinner from './common/components/PageSpinner';
import { Auth } from './pages/Auth';

/* catch-all */
const NotFoundRoute = ({ fallback = '/' }) => <ReactRouterRedirect to={fallback} />;

NotFoundRoute.propTypes = {
  fallback: PropTypes.string,
};

function ProtectedRoute({ component: Component, accessCode, ...rest }) {
  const username = useSelector(getUsername);
  const { keycloak } = useKeycloak();
  const { authenticated } = keycloak;
  const { isLoading } = useGetUserAporTypes();

  if (isLoading) {
    return <PageSpinner />;
  }

  const getElement = ({ ...props }) =>
    authenticated ? (
      <>
        <NavigationBar username={username} />
        <Component {...props} />
      </>
    ) : (
      <ReactRouterRedirect
        to={{
          pathname: '/auth/login',
        }}
      />
    );

  return <Route {...rest} render={getElement} />;
}

ProtectedRoute.propTypes = {
  component: PropTypes.elementType,
  accessCode: PropTypes.string.isRequired,
};

export function AppRoutes() {
  const token = useSelector(getUserToken);
  console.log('token ', token);
  return (
    <Switch>
      <Route
        exact
        path="/"
        render={() => <ReactRouterRedirect to={{ pathname: '/access-passes' }} />}
      />
      <Route exact path="/login" render={({ history }) => <Login history={history} />} />
      <Route exact path="/activate-user" render={() => <ActivateUser />} />
      <Route exact path="/auth/:authAction" render={(match) => <Auth match={match} />} />

      {PROTECTED_ROUTES.map(({ path, component, exact }) => (
        <ProtectedRoute
          accessCode={token}
          key="path"
          path={path}
          component={component}
          exact={exact}
        />
      ))}
      <Route component={NotFoundRoute} />
    </Switch>
  );
}

export default AppRoutes;
