import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';

const app = express();
const PORT = 3000;

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hardcoded landmark coordinate mappings for Suncheon Area
// This works as a fallback database and for starting/destination lookup
const HARDCODED_LANDMARKS: { [key: string]: { lat: number; lng: number } } = {
  '순천역': { lat: 34.9457, lng: 127.5034 },
  '신대지구': { lat: 34.9430, lng: 127.5610 },
  '연향동': { lat: 34.9520, lng: 127.5120 },
  '금당': { lat: 34.9590, lng: 127.5250 },
  '시내': { lat: 34.9510, lng: 127.4790 },
  '중앙동': { lat: 34.9510, lng: 127.4790 },
  '조례동': { lat: 34.9580, lng: 127.5270 },
  '순천만국가정원': { lat: 34.9315, lng: 127.5020 },
  '국가정원': { lat: 34.9315, lng: 127.5020 },
  '순천만습지': { lat: 34.8970, lng: 127.5090 },
  '습지': { lat: 34.8970, lng: 127.5090 },
  '이마트': { lat: 34.9485, lng: 127.5115 },
  '홈플러스': { lat: 34.9535, lng: 127.5180 },
  '메가박스': { lat: 34.9560, lng: 127.5120 },
  '호수공원': { lat: 34.9650, lng: 127.5150 },
  '웃장': { lat: 34.9595, lng: 127.4800 },
  '아랫장': { lat: 34.9490, lng: 127.4855 },
  '법원': { lat: 34.9610, lng: 127.5210 }
};

interface Coordinate {
  lat: number;
  lng: number;
}

interface SearchMappedPlace {
  placeName: string;
  lat: number;
  lng: number;
}

// 1. 매핑 딕셔너리(객체) 구성
const SEARCH_MAPPING_DICTIONARY: { keywords: string[]; value: SearchMappedPlace }[] = [
  {
    keywords: ['순천대', '순천대학교', '국립순천대학교', '순천대정문'],
    value: {
      placeName: '순천대학교 정문 앞 택시 승강장',
      lat: 34.968,
      lng: 127.481
    }
  },
  {
    keywords: ['순천역'],
    value: {
      placeName: '순천역',
      lat: 34.9457,
      lng: 127.5034
    }
  },
  {
    keywords: ['신대지구', '신대'],
    value: {
      placeName: '신대지구',
      lat: 34.9430,
      lng: 127.5610
    }
  },
  {
    keywords: ['연향동'],
    value: {
      placeName: '연향동',
      lat: 34.9520,
      lng: 127.5120
    }
  },
  {
    keywords: ['금당'],
    value: {
      placeName: '금당',
      lat: 34.9590,
      lng: 127.5250
    }
  }
];

/**
 * 띄어쓰기를 무시하고 검색어가 사전 정의된 매핑 딕셔너리에 해당하는지 우선 체크하는 함수
 */
function lookupDictionaryMapping(query: string): SearchMappedPlace | null {
  const normalized = query.replace(/\s+/g, '').toLowerCase();
  
  for (const group of SEARCH_MAPPING_DICTIONARY) {
    for (const kw of group.keywords) {
      const normalizedKeyword = kw.replace(/\s+/g, '').toLowerCase();
      if (normalized === normalizedKeyword || normalized.includes(normalizedKeyword) || normalizedKeyword.includes(normalized)) {
        return group.value;
      }
    }
  }
  return null;
}

/**
 * 2. 검색 및 좌표 반환 함수 로직 (Search and Coordinate Retrieve Logic)
 * 사용자의 검색어가 들어오면 띄어쓰기를 무시하고 매핑 딕셔너리에 해당하는 키워드가 있는지 먼저 검사합니다.
 * 매칭되는 키워드(순천대, 신대지구 등)가 있다면: 외부 카카오 로컬 API 장소 검색을 호출하지 않고, 딕셔너리에 있는 장소명과 위경도를 즉시 반환합니다.
 * 매칭되는 키워드가 없다면: 외부 카카오 장소 검색 API를 호출해서 나온 결과의 첫 번째 장소명과 위경도를 반환합니다.
 */
async function searchPlaceAndCoords(query: string, apiKey: string | undefined): Promise<SearchMappedPlace> {
  const normalizedQuery = query.trim();
  const stripped = normalizedQuery.replace(/\s+/g, '').toLowerCase();
  
  if (!normalizedQuery) {
    throw new Error('정확한 장소명을 입력해 주세요.');
  }

  // (1) 디버깅 로그: 어떤 단어가 들어왔는지
  console.log(`[디버깅-입력] 검색어 입력 접수: "${query}" (공백 제거 및 소문자화: "${stripped}")`);

  // A. 띄어쓰기를 무시하고 딕셔너리에 매칭되는지 확인
  const mapped = lookupDictionaryMapping(normalizedQuery);
  if (mapped) {
    // (2) 디버깅 로그: 딕셔너리를 통해 최종 추출된 lat, lng 값
    console.log(`[디버깅-변환 완료] 사전 정의 딕셔너리 매핑 매칭 성공:
    - 입력 검색어: "${query}"
    - 최종 매칭 명칭: "${mapped.placeName}"
    - 최종 추출 좌표: lat: ${mapped.lat}, lng: ${mapped.lng}`);
    return mapped;
  }

  // B. 매칭되는 키워드가 없을 때: 정상적으로 외부 카카오 장소 검색 API를 호출해서 결과 반환
  if (apiKey && apiKey.trim()) {
    try {
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(normalizedQuery)}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `KakaoAK ${apiKey}` }
      });

      if (res.ok) {
        const data = await res.json() as any;
        if (data.documents && data.documents.length > 0) {
          const firstResult = data.documents[0];
          const resultPlace: SearchMappedPlace = {
            placeName: firstResult.place_name,
            lat: parseFloat(firstResult.y),
            lng: parseFloat(firstResult.x),
          };
          // (2) 디버깅 로그: 외부 로컬 API를 통해 최종 추출된 lat, lng 값
          console.log(`[디버깅-변환 완료] 카카오 로컬 API 장소 검색 매칭 성공:
          - 입력 검색어: "${query}"
          - 최종 매칭 명칭: "${resultPlace.placeName}"
          - 최종 추출 좌표: lat: ${resultPlace.lat}, lng: ${resultPlace.lng}`);
          return resultPlace;
        } else {
          // 검색 결과가 없을 경우 (데이터 빈 배열) "정확한 장소명을 입력해 주세요." 에러 메시지 반환
          console.warn(`[!] [카카오 API 장소결과 없음] 검색어: "${normalizedQuery}" 결과 목록이 빈 배열입니다.`);
          throw new Error('정확한 장소명을 입력해 주세요.');
        }
      } else {
        console.warn(`[!] 카카오 로컬 API 호출 결과 실패 (상태 코드: ${res.status})`);
        throw new Error('정확한 장소명을 입력해 주세요.');
      }
    } catch (error: any) {
      console.error(`[!] 카카오 로컬 API 호출 중 예외 발생:`, error.message);
      throw error;
    }
  }

  // C. API 키가 없거나 외부 API가 작동하지 않았을 경우 자체 랜드마크 사전에서 보정 처리 (Fallback)
  for (const [key, value] of Object.entries(HARDCODED_LANDMARKS)) {
    const landmarkKeyNormalized = key.replace(/\s+/g, '').toLowerCase();
    if (stripped.includes(landmarkKeyNormalized) || landmarkKeyNormalized.includes(stripped)) {
      const landmarkResult: SearchMappedPlace = {
        placeName: key,
        lat: value.lat,
        lng: value.lng
      };
      // (2) 디버깅 로그: 로컬 랜드마크 딕셔너리로 추출된 최종 lat, lng
      console.log(`[디버깅-변환 완료] 로컬 랜드마크 하드코딩 사전 매칭 성공:
      - 입력 검색어: "${query}"
      - 최종 매칭 명칭: "${landmarkResult.placeName}"
      - 최종 추출 좌표: lat: ${landmarkResult.lat}, lng: ${landmarkResult.lng}`);
      return landmarkResult;
    }
  }

  // 최종 Fallback: 검색어에 대응하는 매칭 결과가 없음 (더미 임의의 값을 반환하지 않고 명확한 에러 반환)
  console.log(`[!] [검색 실패] "${normalizedQuery}" 에 대응하는 어떠한 좌표 정보도 확인 불가하여 에러를 던집니다.`);
  throw new Error('정확한 장소명을 입력해 주세요.');
}

/**
 * 1. 목적지 좌표 강제 매핑 (전처리 로직)
 * 사용자가 입력한 목적지 검색어에 "순천대", "순천대학교", "국립순천대학교", "순천대 정문"이 포함되어 있다면,
 * 장소 검색 API가 반환한 위도/경도를 무시하고 '순천대학교 정문 앞 택시 승강장'의 고정 좌표(lat: 34.968, lng: 127.481)로 덮어씌웁니다.
 */
function preprocessDestination(text: string, originalCoords: Coordinate | null): { coords: Coordinate; isMapped: boolean } {
  const normalized = text.replace(/\s+/g, '').toLowerCase();
  
  // 전처리 감지 키워드 목록
  const targetKeywords = ['순천대', '순천대학교', '국립순천대학교', '순천대정문'];
  const hasKeyword = targetKeywords.some(keyword => normalized.includes(keyword));

  if (hasKeyword) {
    console.log(`[!] [전처리 매핑] 목적지 "${text}" 개발 보정 적용: 캠퍼스 중앙이 아닌 '순천대학교 정문 앞 택시 승강장' 좌표(lat: 34.968, lng: 127.481)로 강제 고정합니다.`);
    return {
      coords: { lat: 34.968, lng: 127.481 },
      isMapped: true
    };
  }

  // 다른 일반 지역의 경우 (신대지구, 연향동, 금당 등)
  // 입력된 원래 좌표가 있다면 그대로 사용
  if (originalCoords) {
    console.log(`[전처리] 일반 목적지 "${text}" 원래 API 좌표를 그대로 사용합니다. (lat: ${originalCoords.lat}, lng: ${originalCoords.lng})`);
    return {
      coords: originalCoords,
      isMapped: false
    };
  }

  // 좌표가 전달되지 않고 사전 정의된 대표 지역일 때 하드코딩된 landmark lookup
  for (const [key, value] of Object.entries(HARDCODED_LANDMARKS)) {
    const landmarkKeyNormalized = key.replace(/\s+/g, '').toLowerCase();
    if (normalized.includes(landmarkKeyNormalized)) {
      console.log(`[전처리] 사전정의 랜드마크 매칭: "${key}" -> lat: ${value.lat}, lng: ${value.lng}`);
      return {
        coords: value,
        isMapped: false
      };
    }
  }

  // 기본값 fallback (순천역)
  return {
    coords: { lat: 34.9457, lng: 127.5034 },
    isMapped: false
  };
}

/**
 * 2. 정확한 요금 및 경로 계산 (자동차 길찾기 API 연동)
 * 전처리된 실제 주행 좌표쌍을 기반으로 카카오모빌리티 '자동차 길찾기 API'를 실제 호출합니다.
 * 최적 주행 거리, 예상 소요 시간, 예상 택시 요금(taxi_fare) 값을 추출합니다.
 */
async function getKakaoMobilityDirections(origin: Coordinate, dest: Coordinate, apiKey: string) {
  try {
    console.log(`[자동차 길찾기 API 호출] origin(${origin.lng}, ${origin.lat}) -> destination(${dest.lng}, ${dest.lat})`);
    // 카카오내비 공식 자동차 길찾기 API 주소 사용
    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.lng},${origin.lat}&destination=${dest.lng},${dest.lat}&priority=RECOMMEND`;
    
    const res = await fetch(url, {
      headers: { 'Authorization': `KakaoAK ${apiKey}` }
    });

    if (!res.ok) {
      throw new Error(`Kakao Mobility Directions API returned HTTP status ${res.status}`);
    }

    const data = await res.json() as any;
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      if (route.result_code === 0 && route.summary) {
        // 실제 카카오가 반환하는 원본 값 추출
        const originalDistance = route.summary.distance; // 주행거리 (미터 단위)
        const originalTaxiFare = route.summary.fare.taxi; // 예상 택시 요금 (원)

        // (3) 디버깅 로그: 길찾기 API 호출 직후 카카오가 반환한 실제 distance와 taxi_fare 원본 값
        console.log(`[디버깅-길찾기 API 호출 결과] 카카오내비 실제 API 연동 성공:
        - 카카오 반환 실제 distance (미터): ${originalDistance} m
        - 카카오 반환 예상 taxi_fare (원): ${originalTaxiFare} KRW`);

        const distanceKm = originalDistance / 1000; // 미터 -> 킬로미터 변환
        const travelTimeMinutes = Math.ceil(route.summary.duration / 60); // 초 -> 분 변환

        return {
          distance: parseFloat(distanceKm.toFixed(2)),
          travelTime: travelTimeMinutes,
          totalFare: originalTaxiFare,
          isRealApi: true
        };
      } else {
        throw new Error(`Kakao Directions result code: ${route.result_code} (${route.result_msg || 'unknown error'})`);
      }
    } else {
      throw new Error(`Kakao Directions API returned empty routes list.`);
    }
  } catch (error) {
    console.error(`[!] 카카오모빌리티 Directions API 연동 실패:`, error);
    return null;
  }
}

/**
 * 카카오 API 연동 키가 없거나 API 통신 장애 시 작동하는 '고성능 국지주행 시뮬레이터'
 * 순천시 전세 택시 정산요율(4300원 기본, 130m당 100원 요금)을 똑같이 적용합니다.
 */
function runSuncheonDrivingSimulator(origin: Coordinate, dest: Coordinate) {
  const R = 6371; // 지구 반경 (km)
  const dLat = (dest.lat - origin.lat) * Math.PI / 180;
  const dLon = (dest.lng - origin.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const straightDistance = R * c;
  
  // 순천시 시내 실주행 보정 변수 (직선거리 대비 1.35배)
  // 강제로 0.5km(500m) 고정하게 만들었던 Math.max(0.5, ...)를 완벽하게 삭제하여 실제 비례 거리 반영
  const roadDistance = parseFloat((straightDistance * 1.35).toFixed(2)); 
  
  // 순천시 택시 요금 체계
  const baseFare = 4300;
  const baseDistance = 2.0; 
  const distanceRate = 130; 
  const fareRate = 100;
  
  let totalFare = baseFare;
  if (roadDistance > baseDistance) {
    const extraDistanceMeters = (roadDistance - baseDistance) * 1000;
    const extraCharge = Math.ceil(extraDistanceMeters / distanceRate) * fareRate;
    totalFare += extraCharge;
  }
  
  // 신호 수신 및 밀림 등 실제 주행 시간가산 버퍼 적용 (1.5km 초과 시 약 8% 보정)
  if (roadDistance > 1.5) {
    totalFare = Math.round((totalFare * 1.08) / 100) * 100;
  } else {
    totalFare = Math.round(totalFare / 100) * 100;
  }
  
  // 평균 시속 32km 준수 시 예상 소요 시간 계산
  const travelTime = Math.max(3, Math.ceil((roadDistance / 32) * 60 + 2)); 

  // (3) 디버깅 로그: 시뮬레이터로 구동된 길찾기 결과 로그 출력
  console.log(`[디버깅-길찾기 시뮬레이터 결과] 카카오 API를 미사용(또는 우회)하여 가동된 국지주행 결과:
  - 계산된 실제 도로 거리 (km): ${roadDistance} km
  - 예상 주행 시간 (분): ${travelTime} 분
  - 계산된 총 예상 택시 요금 (원): ${totalFare} KRW`);

  return {
    distance: roadDistance,
    travelTime,
    totalFare,
    isRealApi: false
  };
}

// ======================== API Endpoints ========================

/**
 * 실시간 택시 경로 및 요금 예측 API 엔드포인트
 * GET & POST 두 가지 방식으로 유연한 연동을 지원합니다.
 */
app.all('/api/fare-estimate', async (req, res) => {
  try {
    const originText = (req.query.originText || req.body.originText || '') as string;
    const destText = (req.query.destText || req.body.destText || '') as string;

    if (!originText.trim() || !destText.trim()) {
      return res.status(400).json({
        status: 'error',
        message: '출발지와 도착지를 지정해 주세요.'
      });
    }

    console.log(`[Fare Estimate API] 요청 접수: 출발지="${originText}", 목적지="${destText}"`);

    const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;

    // 1. 위도 경도 구하기 (검색어 사전 매핑 딕셔너리 + 카카오 Keyword API 우선순위 통합 검색)
    const originSearch = await searchPlaceAndCoords(originText, KAKAO_KEY);
    const destSearch = await searchPlaceAndCoords(destText, KAKAO_KEY);

    const resolvedOriginCoords: Coordinate = { lat: originSearch.lat, lng: originSearch.lng };
    const resolvedDestCoords: Coordinate = { lat: destSearch.lat, lng: destSearch.lng };

    // 2. 출발지와 도착지가 완전히 동일한 좌표쌍으로 들어오지 않았는지 검증
    // 위경도 차이가 극소수이거나 완전히 값 자체가 동일한 경우 에외 처리
    const diffLat = Math.abs(resolvedOriginCoords.lat - resolvedDestCoords.lat);
    const diffLng = Math.abs(resolvedOriginCoords.lng - resolvedDestCoords.lng);
    
    if (diffLat < 0.0001 && diffLng < 0.0001) {
      console.log(`[!] [동일 좌표 오류] 출발지와 도착지의 좌표가 완전히 일치하거나 거의 동일합니다. lat diff=${diffLat}, lng diff=${diffLng}`);
      return res.status(400).json({
        status: 'error',
        message: '출발지와 도착지의 좌표가 일치합니다. 서로 다른 장소를 선택해 주세요.'
      });
    }

    // 3. 목적지 좌표 강제 매핑 전처리 수행 (순천대 및 정문 예외 체크의 예비 더블 가산)
    const processedDest = preprocessDestination(destText, resolvedDestCoords);

    // 4. 자동차 길찾기 API 연동 및 요금/소요시간 산출
    let metricsResult = null;

    if (KAKAO_KEY && KAKAO_KEY.trim()) {
      metricsResult = await getKakaoMobilityDirections(resolvedOriginCoords, processedDest.coords, KAKAO_KEY);
    }

    // 카카오 API 연동이 실패했거나 키가 지정되어 있지 않을 경우 로컬 최적 주행 시뮬레이터 가동
    if (!metricsResult) {
      console.log(`[!] 시뮬레이터 가동: 실시간 자동차 요금 예측 연산을 우회 계산합니다.`);
      metricsResult = runSuncheonDrivingSimulator(resolvedOriginCoords, processedDest.coords);
    }

    // 완성된 분석 결과를 프론트엔드로 깔끔하게 반환!
    res.json({
      status: 'success',
      origin: {
        text: originText,
        lat: resolvedOriginCoords.lat,
        lng: resolvedOriginCoords.lng
      },
      destination: {
        text: destText,
        lat: processedDest.coords.lat,
        lng: processedDest.coords.lng,
        isPreprocessorMapped: processedDest.isMapped
      },
      metrics: {
        distance: metricsResult.distance, // 최적 주행 거리 (km)
        travelTime: metricsResult.travelTime, // 예상 소요 시간 (분)
        totalFare: metricsResult.totalFare, // taxi_fare 예상 택시 요금 (원)
        isRealApi: metricsResult.isRealApi // 실시간 라이브 네트워크 데이터 참조 여부
      },
      systemLog: {
        timestamp: new Date().toISOString(),
        info: "순천대학교 정문 입구 택시 정강장 강제 매핑 및 실제 자동차 주행 요금 체계 정산 모델링"
      }
    });

  } catch (error: any) {
    console.error(`[!] 최적 요금 산정 API 오류:`, error);
    const isUserError = error.message && (error.message.includes('장소명') || error.message.includes('동일'));
    const statusCode = isUserError ? 400 : 500;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || '요금 및 최적 경로를 정산하는 도중 서버 내부 예외가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * 검색어 사전 매핑 및 Kakao Keyword 장소 검색 기반 주소/좌표 탐색 API
 * GET/POST /api/place-search?query=검색어
 * 반환 형식: { placeName: "장소명", lat: 위도, lng: 경도 } 형태로 통일
 */
app.all('/api/place-search', async (req, res) => {
  try {
    const query = (req.query.query || req.body.query || '') as string;
    
    if (!query.trim()) {
      return res.status(400).json({
        status: 'error',
        message: '검색어(query) 파라미터가 누락되었습니다.'
      });
    }

    console.log(`[Place Search API] 검색 요청 접수: "${query}"`);
    
    const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;
    
    // 띄어쓰기 무수 장소 매핑 + 카카오 API / 자체 사전 Fallback을 지원하는 통합 함수 호출
    const result = await searchPlaceAndCoords(query, KAKAO_KEY);

    // 사용자의 요건에 따라 { placeName, lat, lng }로 결과 포맷을 완전히 통일하여 반환
    return res.json({
      placeName: result.placeName,
      lat: result.lat,
      lng: result.lng
    });

  } catch (error: any) {
    console.error(`[!] 장소 검색 API 처리 오류:`, error);
    const isUserError = error.message && error.message.includes('장소명');
    const statusCode = isUserError ? 400 : 500;
    return res.status(statusCode).json({
      status: 'error',
      message: error.message || '장소 및 좌표를 검색하여 반환하는 도중 서버 내부 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// Configure Vite middleware or custom static server based on environment
async function setupViteOrStaticServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`[-] [DEV Mode] Vite Dev-Middleware mounted successfully.`);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`[-] [PRODUCTION Mode] Static assets served from "/dist" folder.`);
  }
}

setupViteOrStaticServer().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[+] Fullstack Server is successfully hosting on http://0.0.0.0:${PORT}`);
  });
});
