import * as React from 'react';
import { Button, CssBaseline, Divider, Stack, styled, Checkbox } from '@mui/material';
import { FormControlLabel, FormControl, FormLabel, TextField, Box, Typography, Link } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { useAuth } from '../Context/AuthContext';
import ForgotPassword from './components/ForgotPassword';
import ForgotId from './components/ForgotId';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import SitemarkIcon from '../components/SitemarkIcon';
import axios from 'axios';


const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '600px',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignIn(props) {
  const { setUserid } = useAuth();
  const [rememberMe, setRememberMe] = React.useState(() => {
    return localStorage.getItem('rememberedUserId') ? true : false;
  });
  const [userId, setUserId] = React.useState(() => {
    return localStorage.getItem('rememberedUserId') || '';
  });
  const [userIdError, setUserIdError] = React.useState(false);
  const [userIdErrorMessage, setUserIdErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [openId, setOpenId] = React.useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleClickOpenId = () => setOpenId(true);
  const handleCloseId = () => setOpenId(false);

  const handleSubmit = async (event) => {
  event.preventDefault(); // 기본 폼 제출 동작을 방지.

  // 입력값 가져오기
  const data = new FormData(event.currentTarget);
  const userId = data.get('userId');
  const password = data.get('password');

  // 입력값 검증
  if (!validateInputs()) return;
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('username', userId); // 백엔드의 username 키에 맞게 수정
    formData.append('password', password);

    // Axios 요청
    const response = await axios.post('/users/login', formData, {
        headers: {
            'Content-Type': 'multipart/form-data', // form-data 형식 지정
        },
        withCredentials: true,
    });

    console.log(response);
    // 응답 처리
    if (response.status === 200) {
      alert(response)
        if (rememberMe) {
          localStorage.setItem('rememberedUserId', userId);
          setUserid(userId);
        } else {
          localStorage.removeItem('rememberedUserId');
        }
        if(userId==='admin')
          window.location.href='/admin/dashboard';
        else
          window.location.href = '/'; // 성공 시 페이지 이동
    } else {
        throw new Error('로그인 실패');
    }
  } catch (error) {
      // 실패 처리
      setUserIdError(true);
      setUserIdErrorMessage('유효하지 않은 계정입니다.');
      console.error(error);
  }
  };

  const validateInputs = () => {
    const userId = document.getElementById('userId');
    const password = document.getElementById('password');

    let isValid = true;

    if (!userId) {
      setUserIdError(true);
      setUserIdErrorMessage('Please enter a valid userId address.');
      isValid = false;
    } else {
      setUserIdError(false);
      setUserIdErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2, 
          }}
        >
          <SitemarkIcon height={20} />
        </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="userId">ID</FormLabel>
              <TextField
                error={userIdError}
                helperText={userIdErrorMessage}
                id="userId"
                type="text"
                name="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your Id"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={userIdError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Sign in
            </Button>
            <ForgotPassword open={open} handleClose={handleClose} />
            <ForgotId open={openId} handleClose={handleCloseId} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,         
              }}
            >
              <Link
                component="button"
                type="button"
                onClick={handleClickOpenId}
                variant="body2"
              >
                Forgot your ID?
              </Link>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                /
              </Typography>
              <Link
                component="button"
                type="button"
                onClick={handleClickOpen}
                variant="body2"
              >
                Forgot your password?
              </Link>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <Link
                href="/agree"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
