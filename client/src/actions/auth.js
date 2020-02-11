import axios from 'axios';
import { setAlert } from './alert';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
} from './types';

//Load User

export const loadUser = () => async dispatch => {};

//Register user

export const register = ({ name, email, password }) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({ name, email, password });

  console.log(body);

  try {
    const res = await axios.post('/api/users', body, config);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    console.log('caught');
    console.log(error);
    console.log(Object.keys(error));
    const errors = error.response.data.error;
    console.log(errors);
    if (errors) {
      errors.forEach(element => {
        console.log(element.msg);
        dispatch(setAlert(element.msg, 'danger', 3000));
      });
    }
    dispatch({
      type: REGISTER_FAIL,
    });
  }
};
