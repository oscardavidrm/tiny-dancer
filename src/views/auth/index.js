import React, {Fragment, useState, useEffect} from 'react';
import {login} from '../../actions/auth';
import Web3 from 'web3';

const Auth = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const {email, password} = formData;

  const onChange = (e) =>
    setFormData({...formData, [e.target.name]: e.target.value});

  const onSubmit = async (e) => {
    e.preventDefault();

    if (window.web3) {
      // Instantiate a new web3 with full capabilities
      const web3 = new Web3(Web3.givenProvider, null, {});

      // Request the user account and save it into input
      const accounts = await web3.eth.requestAccounts();
      console.log(accounts);
      const signature = await web3.eth.personal.sign(
        'Please sign here',
        accounts[0],
        '',
      );

      console.log(signature);
      login(email, password);
    } else {
      needMetamaskAlert();
    }
  };

  useEffect(() => {
    if (!window.web3) {
      needMetamaskAlert();
    }
  });

  /**
   * Alert of no metamask
   */
  const needMetamaskAlert = () => {
    alert('This app needs some web3 provider such as metamask');
  };

  return (
    <Fragment>
      {' '}
      <h1 className="large text-primary">Register</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Register Your Account
      </p>
      <form className="form" onSubmit={(e) => onSubmit(e)}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
            value={password}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Login" />
      </form>
      <p className="my-1">Dont have an account? Sign Up</p>
    </Fragment>
  );
};

export default Auth;
