import React, { useCallback, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "../../components/styles/login.css";
import UserContext from "../../components/context";

const initialStateInfo = {
  user_name: "",
  user_password: "",
};

function LoginPage() {
  const { setUserRole } = React.useContext(UserContext);
  const [info, setInfo] = useState(initialStateInfo);

  const history = useHistory();

  const userRef = useRef(null);
  const passwordRef = useRef(null);
  useEffect(() => {
    const token = Cookies.get("zodiac_token");

    if (token) {
      history.push("/");
    }
  }, [history]);
  //pushing to edit the database url
  const ChangeInfo = useCallback((e) => {
    setInfo((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
  }, []);
  const ValidateUser = useCallback(
    async (e) => {
      e.preventDefault();
      const username = userRef.current.value;
      const password = passwordRef.current.value;
      if (username.length === 0 || password.length === 0) {
        toast.error("Please fill all fields");
      } else {
        try {
          const { data } = await axios.post(
            "http://127.0.0.1:5000/api/login",
            info,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (data.token) {
            Cookies.set("zodiac_token", data.token);
            const { user_name } = jwtDecode(data.token);
            setUserRole(user_name);

            toast.success(
              `Welcome Mr. ${
                user_name.charAt(0).toUpperCase() +
                user_name.slice(1).toLowerCase()
              }`
            );
            history.push("/");
          }
        } catch ({ response: { data } }) {
          toast.error(data.error);
        }
      }
    },
    [info, history]
  );

  const submitUserData = (e) => {
    e.preventDefault();
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={(e) => submitUserData(e)}>
          <div className="user-box">
            <input
              type="text"
              placeholder="User Name"
              ref={userRef}
              name="user_name"
              onChange={(e) => ChangeInfo(e)}
              autoComplete="user_name"
              required
            />
            <label>User Name</label>
          </div>
          <div className="user-box">
            <input
              type="password"
              placeholder="Password"
              ref={passwordRef}
              name="user_password"
              onChange={(e) => ChangeInfo(e)}
              autoComplete="current-password"
              required
            />
            <label>Password</label>
          </div>
          <Link to="" onClick={(e) => ValidateUser(e)}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Login
          </Link>{" "}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
