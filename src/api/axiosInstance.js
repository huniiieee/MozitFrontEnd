import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://mozit-spring-leo8071004-e7b9gwh9cuayc2gf.koreacentral-01.azurewebsites.net',
  withCredentials: true,
});

export const attachAuthInterceptors = (getAccessToken, setAccessToken, setUserName) => {
    axiosInstance.interceptors.request.use(
      (config) => {
        const accessToken = getAccessToken(); 
        console.log('Access Token in Axios Interceptor:', accessToken);
        if (accessToken) {
          config.headers['Authorization'] = `${accessToken}`;
        }
        console.log('Authorization Header:', config.headers['Authorization']);
        return config;
      },
      (error) => Promise.reject(error)
    );
  
    // 응답 인터셉터
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
  
        // 401 Unauthorized 처리 (토큰 갱신)
        if ((error.response?.status === 401 || error.response?.status === 400) && !originalRequest._retry) {
          originalRequest._retry = true;
          const errorMessage = error.response?.data;

          // 비밀번호 불일치 에러 처리
          if (errorMessage === "PASSWORD_MISMATCH") {
            console.error("비밀번호가 일치하지 않습니다.");
            return Promise.reject(error);
          }

          try {
            const response = await axios.post('/auth/refresh', null, { withCredentials: true });
            console.log('Refresh Token Response:', response.headers['authorization']); // 디버깅용
            console.log(response.data.username)
            setUserName(response.data.username);
            
            const newAccessToken = response.headers['authorization'];
            if (newAccessToken) {
              setAccessToken(newAccessToken); // Context에 저장
              
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              console.log('New Access Token:', newAccessToken); // 디버깅용
              return axiosInstance(originalRequest); // 요청 재시도
            }
          } catch (refreshError) {
            console.error('Refresh Token Error:', refreshError);
            window.location.href = '/sign-in';
            return Promise.reject(refreshError);
          }
        }
  
        return Promise.reject(error); // 다른 에러는 그대로 반환
      }
    );
  };

export default axiosInstance;
