/* eslint-disable consistent-return */
/* eslint-disable func-names */
export default function ({ store, redirect }) {
  if (store.state.auth.loggedIn) {
    return redirect('/dashboard')
  }
}
