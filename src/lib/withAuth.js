const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * withAuth — getServerSideProps wrapper for protected pages.
 *
 * Usage:
 *   export const getServerSideProps = withAuth(async (context, session) => {
 *     return { props: { anything: true } };
 *   });
 *
 * Injects `session` into props: { sub, displayName, duressMode }
 * Redirects to /login if the cookie is missing or the JWT is invalid/expired.
 */
function withAuth(getServerSidePropsFunc) {
  return async (context) => {
    const { req, res } = context;
    const token = req.cookies?.auth_token;

    if (!token) {
      return { redirect: { destination: '/login', permanent: false } };
    }

    let session;
    try {
      const decoded = jwt.verify(token, config.env.JWT_SECRET);
      session = {
        sub: decoded.sub,
        displayName: decoded.displayName,
        duressMode: decoded.duressMode || false,
      };
    } catch {
      // Expired or tampered — clear the cookie and send to login.
      res.setHeader(
        'Set-Cookie',
        'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
      );
      return { redirect: { destination: '/login', permanent: false } };
    }

    if (!getServerSidePropsFunc) {
      return { props: { session } };
    }

    const result = await getServerSidePropsFunc(context, session);

    // Merge session into props without overwriting notFound / redirect results.
    if (result.props) {
      return { props: { ...result.props, session } };
    }
    return result;
  };
}

module.exports = { withAuth };
