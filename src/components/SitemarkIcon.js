import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

export default function SitemarkIcon({ height = 30, sx }) {
  const theme = useTheme();

  const imageUrlDark = '/assets/img/brand/mozit.png';  // 다크 모드 이미지 경로
  const imageUrlLight = '/assets/img/brand/mozit2.png'; // 라이트 모드 이미지 경로

  const imageUrl = theme.palette.mode === 'dark' ? imageUrlDark : imageUrlLight;
  
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      
      ...sx // 여기서 전달된 추가 스타일을 덮어쓰게 함
    }}>
      <a href="/" style={{ textDecoration: 'none' }}>  {/* 경로를 /로 고정 */}
        <img
          src={imageUrl}  // public 폴더 기준 경로
          alt="Logo"
          style={{ height: `${height}px` }}  // height를 props로 설정
        />
      </a>
    </Box>
  );
}

