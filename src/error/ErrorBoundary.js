import React, { Component } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../shared-theme/AppTheme';
import { Container, Typography, Button, Paper, Box } from '@mui/material';
import { Link } from "react-router-dom";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <Container 
                maxWidth="md" 
                sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
            >
            <Paper 
              elevation={6} 
              sx={{
                padding: 5,
                textAlign: "center",
                borderRadius: 3,
                width: { xs: "90%", md: "50%" },
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center">
                <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
                <Typography variant="h2" color="error" gutterBottom>
                  오류 발생
                </Typography>
                <Typography variant="h5" gutterBottom>
                  예상치 못한 오류가 발생했습니다.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: "gray" }}>
                  문제가 계속 발생하면 관리자에게 문의해주세요.
                </Typography>
                <Button variant="contained" color="primary" component={Link} to="/">
                  홈으로 가기
                </Button>
              </Box>
            </Paper>
          </Container>
        </AppTheme>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;