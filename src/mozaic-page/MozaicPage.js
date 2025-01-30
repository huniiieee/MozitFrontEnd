import React , { useRef, useState, useEffect, useCallback  }from 'react';
import { useLocation } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AppTheme from '../shared-theme/AppTheme';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Slider from '@mui/material/Slider';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { Link } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';



export default function MozaicPage() {
  const location = useLocation();
  const savedFileName = 'mozit.mp4'; // 전달된 savedFileName 받기
  const videoUrl = savedFileName ? `http://localhost:8080/edit/videos/${savedFileName}` : null;

  // 캔버스와 비디오 참조
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [value, setValue] = useState(0); // 탭 상태 추가
  const [detectionData, setDetectionData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [sliderValue, setSliderValue] = useState(0); // 슬라이더 값을 상태로 관리


  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setCanvasSize({
        width: video.videoWidth,
        height: video.videoHeight,
      });
      setVideoDuration(video.duration); // 비디오 길이 설정
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error("Error playing the video:", error);
        });
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };




  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue); // 슬라이더 값 업데이트
    const video = videoRef.current;
    video.currentTime = (newValue / 100) * videoDuration; // 슬라이더 값에 비례하여 현재 재생 시간 조정
  };



  const handleCanvasClick = () => {
  const video = videoRef.current;
  if (video) {
    if (video.paused) {
      handlePlayPause(); // 재생
    } else {
      handlePlayPause(); // 일시 정지
    }
  }
};


  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateSlider = () => {
        const currentSliderValue = (video.currentTime / videoDuration) * 100; // 비디오 현재 시간 비율
        setSliderValue(currentSliderValue); // 슬라이더 값 업데이트
      };
      
      video.addEventListener('timeupdate', updateSlider);
      return () => {
        video.removeEventListener('timeupdate', updateSlider);
      };
    }
  }, [videoDuration]);

  // 캔버스에 투명한 색을 그리는 함수
  const drawTransparentOverlay = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // 캔버스 사이즈 설정
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // 투명한 색 사각형 그리기
    context.fillStyle = 'rgba(255, 255, 255, 0)'; // 반투명 빨간색
    context.fillRect(0, 0, canvas.width, canvas.height);


    // 주어진 좌표와 크기로 네모 박스 그리기
    const x = 938.0; // x 좌표
    const y = 335.0; // y 좌표
    const width = 118.0; // 박스 너비
    const height = 144.0; // 박스 높이

    context.strokeStyle = 'red'; // 박스 선 색상
    context.lineWidth = 2; // 박스 선 두께
    context.strokeRect(x, y, width, height); // 네모 박스 그리기
  };


  const drawMosaic = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    if (!video || !ctx) return;
  
    // 캔버스 크기 설정
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
  
    // 비디오 프레임을 캔버스에 그림
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // 현재 재생 중인 프레임 번호 추출
    const currentFrame = Math.floor(video.currentTime * 30); // 30fps 기준
  
    // 해당 프레임의 detections 가져오기
    const currentDetections = detectionData.find(d => d.frame === currentFrame)?.detections || [];
  
    // 모자이크 적용
    currentDetections.forEach(({ x, y, width, height }) => {
      applyMosaic(ctx, x, y, width, height); // 모자이크 적용
  
      // 경계선 그리기
      ctx.strokeStyle = 'black'; // 선 색상
      ctx.lineWidth = 4; // 선 두께
      ctx.strokeRect(x, y, width, height); // 네모 박스 그리기
    });
  };
  

  // 모자이크 적용 함수
const applyMosaic = (ctx, x, y, width, height, blockSize = 10) => {
  for (let i = 0; i < width; i += blockSize) {
    for (let j = 0; j < height; j += blockSize) {
      const pixel = ctx.getImageData(x + i, y + j, blockSize, blockSize);
      const avgColor = getAverageColor(pixel.data);
      
      ctx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
      ctx.fillRect(x + i, y + j, blockSize, blockSize);
    }
  }
};
  
  // 평균 색상을 구하는 함수
  const getAverageColor = useCallback((pixelData) => {
    let r = 0, g = 0, b = 0;
    const pixelCount = pixelData.length / 4;
  
    for (let i = 0; i < pixelData.length; i += 4) {
      r += pixelData[i];
      g += pixelData[i + 1];
      b += pixelData[i + 2];
    }
  
    return {
      r: Math.floor(r / pixelCount),
      g: Math.floor(g / pixelCount),
      b: Math.floor(b / pixelCount),
    };
  }, []);
  
  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const response = await fetch(`http://localhost:8080/edit/videos/${savedFileName}/info`);
        const data = await response.json();
        setDetectionData(data.detections); // JSON 데이터 저장
      } catch (error) {
        console.error("Error fetching detection data:", error);
      }
    };
  
    fetchDetections();
  }, [savedFileName]);


  useEffect(() => {
  let animationFrameId;

  const render = () => {
    if (videoRef.current?.paused || videoRef.current?.ended) return; // 비디오가 멈추면 실행 중지
    drawMosaic();
    animationFrameId = requestAnimationFrame(render);
  };

  const handlePlay = () => {
    render();
  };

  if (videoRef.current) {
    videoRef.current.addEventListener('play', handlePlay);
  }

  return () => {
    videoRef.current?.removeEventListener('play', handlePlay);
    cancelAnimationFrame(animationFrameId);
  };
}, [canvasSize, detectionData]); // detectionData 변경 시 모자이크 업데이트

  
  

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <AppTheme sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <Box sx={{ display: 'flex', height: '100%', padding: 2 }}>
        <Box sx={{ width: '75%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              marginTop: 4,
              color: 'text.primary',
            }}
          >
            모자이크 처리된 동영상
          </Typography>
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                crossOrigin="anonymous"
                // controls
                onLoadedMetadata={handleLoadedMetadata}
                style={{
                  display: 'block',
                  width: '80%', // 비디오 너비를 80%로 설정
                  height: 'auto', // 비율 유지
                  position: 'relative', // 위치 설정
                  top: 0, // 상단 정렬
                  zIndex: 1, // 비디오가 위에 오도록 설정
                  marginBottom: '50px',
                }}
              />
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={handleCanvasClick}
                style={{
                  position: 'absolute', // 절대 위치로 설정
                  top: 0,
                  pointerEvents: 'auto', // 캔버스가 클릭 이벤트를 차단하지 않도록
                  zIndex: 2, // 캔버스가 비디오 위에 오도록 설정
                  width: '80%', // 캔버스 너비를 비디오와 동일하게 설정
                  height: 'auto', // 자동으로 높이 조정
                  top: '68px',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
                  borderRadius: '5px',
                  padding: '10px',
                }}
              >
                <Button onClick={handlePlayPause}>
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </Button>
                <Slider
                  id="video-slider"
                  sx={{ marginLeft: '10px', flexGrow: 1 }}
                  value={sliderValue} 
                  onChange={handleSliderChange}
                />
              </Box>
            </>
          ) : (
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: 'error.main',
                marginTop: 2,
              }}
            >
              처리된 동영상이 없습니다.
            </Typography>
          )}
        </Box>

        <Box sx={{ width: '25%', padding: 2 }}> {/* 1/4 크기로 조정 */}
          <Tabs value={value} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
            <Tab label="유해요소" />
            <Tab label="개인정보" />
            <Tab label="사람" />
          </Tabs>

          {value === 0 && (
            <Box>
              <Typography variant="h6">마스크 설정</Typography>
              <FormControlLabel control={<Checkbox />} label="모자이크" />
              <FormControlLabel control={<Checkbox />} label="블러" />
              <Typography variant="h6">마스크 강도</Typography>
              <Slider defaultValue={50} aria-label="Mask Intensity" />
              <Typography variant="h6">마스크 크기</Typography>
              <Slider defaultValue={100} aria-label="Mask Size" />
              <Typography variant="h6">마스크 체크</Typography>
              <FormControlLabel control={<Checkbox />} label="사람 1" />
              <FormControlLabel control={<Checkbox />} label="사람 2" />
              <FormControlLabel control={<Checkbox />} label="사람 3" />
            </Box>
          )}
          {value === 1 && (
            <Box>
              <Typography variant="h6">마스크 설정</Typography>
              <FormControlLabel control={<Checkbox />} label="모자이크" />
              <FormControlLabel control={<Checkbox />} label="블러" />
              <Typography variant="h6">마스크 강도</Typography>
              <Slider defaultValue={50} aria-label="Mask Intensity" />
              <Typography variant="h6">마스크 크기</Typography>
              <Slider defaultValue={100} aria-label="Mask Size" />
              <Typography variant="h6">마스크 체크</Typography>
              <FormControlLabel control={<Checkbox />} label="사람 1" />
              <FormControlLabel control={<Checkbox />} label="사람 2" />
              <FormControlLabel control={<Checkbox />} label="사람 3" />
            </Box>
          )}
          {value === 2 && (
            <Box>
              <Typography variant="h6">마스크 설정</Typography>
              <FormControlLabel control={<Checkbox />} label="모자이크" />
              <FormControlLabel control={<Checkbox />} label="블러" />
              <Typography variant="h6">마스크 강도</Typography>
              <Slider defaultValue={50} aria-label="Mask Intensity" />
              <Typography variant="h6">마스크 크기</Typography>
              <Slider defaultValue={100} aria-label="Mask Size" />
              <Typography variant="h6">마스크 체크</Typography>
              <FormControlLabel control={<Checkbox />} label="사람 1" />
              <FormControlLabel control={<Checkbox />} label="사람 2" />
              <FormControlLabel control={<Checkbox />} label="사람 3" />
            </Box>
          )}
        </Box>
      </Box>

      <Stack direction="row" spacing={2} sx={{ marginTop: 2, justifyContent: 'center' }}>
        <Button variant="contained" color="primary" component={Link} to="/edit">
          돌아가기
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => {/* 다른 동작 */}}>
          편집완료
        </Button>
      </Stack>
    </AppTheme>
  );
}