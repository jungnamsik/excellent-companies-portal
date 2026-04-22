import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, Building2, Users, Award, Briefcase, Home as HomeIcon } from 'lucide-react';
import { MapView } from '@/components/Map';
import { companies, REGION_NAMES, Company } from '@/data/companies';
import '../styles/home.css';

/**
 * 설계 철학: 구글 지도 저장목록 스타일의 기업 홍보 포털
 * - 모든 기업의 위치를 지도에 표시
 * - 선택/마우스 오버 시 해당 마커 강조
 * - 깔끔한 레이아웃과 명확한 정보 계층구조
 */

interface CompanyDetailModalProps {
  company: Company | null;
  onClose: () => void;
}

const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="modal-logo">
            <img src={company.logo} alt={company.name} />
          </div>
          <div className="modal-title-section">
            <h2 className="modal-title">{company.name}</h2>
            <p className="modal-region">{REGION_NAMES[company.region]}</p>
          </div>
        </div>

        <div className="modal-body">
          {/* 기본 정보 */}
          <section className="modal-section">
            <h3 className="modal-section-title">기본 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">업종</span>
                <span className="info-value">{company.industry}</span>
              </div>
              <div className="info-item">
                <span className="info-label">근로자수</span>
                <span className="info-value">{company.employees.toLocaleString()}명</span>
              </div>
            </div>
          </section>

          {/* 정부 인증 */}
          {company.certifications.length > 0 && (
            <section className="modal-section">
              <h3 className="modal-section-title">정부 인증</h3>
              <div className="badge-group">
                {company.certifications.map((cert, idx) => (
                  <span key={idx} className="badge badge-cert">{cert}</span>
                ))}
              </div>
            </section>
          )}

          {/* 수상 내역 */}
          {company.awards.length > 0 && (
            <section className="modal-section">
              <h3 className="modal-section-title">수상 내역</h3>
              <ul className="list-items">
                {company.awards.map((award, idx) => (
                  <li key={idx}>{award}</li>
                ))}
              </ul>
            </section>
          )}

          {/* 복지 혜택 */}
          {company.benefits.length > 0 && (
            <section className="modal-section">
              <h3 className="modal-section-title">복지 혜택</h3>
              <div className="badge-group">
                {company.benefits.map((benefit, idx) => (
                  <span key={idx} className="badge badge-benefit">{benefit}</span>
                ))}
              </div>
            </section>
          )}

          {/* 근무 환경 */}
          {company.workEnvironment.length > 0 && (
            <section className="modal-section">
              <h3 className="modal-section-title">근무 환경 특징</h3>
              <div className="badge-group">
                {company.workEnvironment.map((env, idx) => (
                  <span key={idx} className="badge badge-env">{env}</span>
                ))}
              </div>
            </section>
          )}

          {/* 기업 소개 이미지 */}
          {company.images.length > 0 && (
            <section className="modal-section">
              <h3 className="modal-section-title">기업 소개</h3>
              <div className="image-gallery">
                {company.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`${company.name} 이미지 ${idx + 1}`} />
                ))}
              </div>
            </section>
          )}

          {/* 홈페이지 */}
          {company.website && (
            <section className="modal-section">
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="website-link">
                기업 홈페이지 방문 →
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hoveredCompanyId, setHoveredCompanyId] = useState<string | null>(null);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(companies);
  const [mapReady, setMapReady] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowsRef = useRef<Map<string, google.maps.InfoWindow>>(new Map());

  // 캐릭터 회전 각도 계산
  const getCharacterRotation = useCallback(() => {
    const targetCompany = selectedCompany || filteredCompanies.find(c => c.id === hoveredCompanyId);
    if (!targetCompany || !map) return 0;

    const mapCenter = map.getCenter();
    if (!mapCenter) return 0;

    const lat1 = mapCenter.lat();
    const lon1 = mapCenter.lng();
    const lat2 = targetCompany.lat;
    const lon2 = targetCompany.lng;

    const dLon = lon2 - lon1;
    const y = Math.sin(dLon * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon * Math.PI / 180);
    const bearing = Math.atan2(y, x) * (180 / Math.PI);

    return bearing;
  }, [selectedCompany, hoveredCompanyId, filteredCompanies, map])

  // 검색 및 필터링 로직
  useEffect(() => {
    let filtered = companies;

    // 지역 필터
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(c => c.region === selectedRegion);
    }

    // 검색어 필터
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.industry.toLowerCase().includes(term) ||
        c.certifications.some(cert => cert.toLowerCase().includes(term)) ||
        c.awards.some(award => award.toLowerCase().includes(term))
      );
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, selectedRegion]);

  // 지도 준비 완료 시
  const handleMapReady = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setMapReady(true);
  }, []);

  // 모든 마커 생성 및 업데이트
  useEffect(() => {
    if (!map || !mapReady) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();
    infoWindowsRef.current.clear();

    // 필터된 기업에 대한 마커 생성
    const bounds = new google.maps.LatLngBounds();
    
    filteredCompanies.forEach(company => {
      // 마커 생성
      const marker = new google.maps.Marker({
        position: { lat: company.lat, lng: company.lng },
        map: map,
        title: company.name,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });

      // 인포윈도우 생성
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 220px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${company.name}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #1e40af; font-weight: 600;">${REGION_NAMES[company.region]}</p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${company.industry}</p>
            <p style="margin: 0; font-size: 11px; color: #999;">근로자: ${company.employees.toLocaleString()}명</p>
          </div>
        `,
      });

      // 마커 클릭 이벤트
      marker.addListener('click', () => {
        // 모든 인포윈도우 닫기
        infoWindowsRef.current.forEach(iw => iw.close());
        // 선택된 마커 인포윈도우 열기
        infoWindow.open(map, marker);
        setSelectedCompany(company);
      });

      // 마커 마우스 오버 이벤트
      marker.addListener('mouseover', () => {
        // 마커 아이콘 변경 (강조)
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        // 인포윈도우 표시
        infoWindowsRef.current.forEach(iw => iw.close());
        infoWindow.open(map, marker);
        setHoveredCompanyId(company.id);
      });

      // 마커 마우스 아웃 이벤트
      marker.addListener('mouseout', () => {
        // 마커 아이콘 복원
        if (selectedCompany?.id !== company.id) {
          marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
          infoWindow.close();
        }
        setHoveredCompanyId(null);
      });

      markersRef.current.set(company.id, marker);
      infoWindowsRef.current.set(company.id, infoWindow);
      bounds.extend({ lat: company.lat, lng: company.lng });
    });

    // 지도 범위 조정
    if (filteredCompanies.length > 0) {
      const padding = { top: 50, right: 50, bottom: 50, left: 400 };
      map.fitBounds(bounds, padding);
    }
  }, [map, mapReady, filteredCompanies]);

  // 기업 선택 시 마커 강조
  useEffect(() => {
    if (!map || !mapReady) return;

    // 모든 마커를 파란색으로 복원
    markersRef.current.forEach(marker => {
      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
    });

    // 선택된 기업의 마커를 빨간색으로 변경
    if (selectedCompany) {
      const selectedMarker = markersRef.current.get(selectedCompany.id);
      if (selectedMarker) {
        selectedMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        // 인포윈도우 표시
        const infoWindow = infoWindowsRef.current.get(selectedCompany.id);
        if (infoWindow) {
          infoWindowsRef.current.forEach(iw => iw.close());
          infoWindow.open(map, selectedMarker);
        }
      }
    }
  }, [selectedCompany, map, mapReady]);

  // 기업 목록 마우스 오버 시 마커 강조
  const handleCompanyHover = useCallback((company: Company | null) => {
    if (!map || !company) {
      setHoveredCompanyId(null);
      return;
    }

    setHoveredCompanyId(company.id);
    const marker = markersRef.current.get(company.id);
    if (marker && selectedCompany?.id !== company.id) {
      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
      const infoWindow = infoWindowsRef.current.get(company.id);
      if (infoWindow) {
        infoWindowsRef.current.forEach(iw => iw.close());
        infoWindow.open(map, marker);
      }
    }
  }, [map, selectedCompany]);

  // 기업 목록 마우스 아웃 시 마커 복원
  const handleCompanyLeave = useCallback((company: Company | null) => {
    if (!map || !company) {
      setHoveredCompanyId(null);
      return;
    }

    setHoveredCompanyId(null);
    const marker = markersRef.current.get(company.id);
    if (marker) {
      if (selectedCompany?.id === company.id) {
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
      } else {
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
        const infoWindow = infoWindowsRef.current.get(company.id);
        if (infoWindow) {
          infoWindow.close();
        }
      }
    }
  }, [map, selectedCompany]);

  return (
    <div className="home-container">
      {/* 헤더 */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <Building2 className="logo-icon" />
            <div className="logo-text">
              <h1 className="site-title">기업성장브릿지 맵</h1>
              <p className="site-subtitle">영등포구 · 강서구 · 양천구</p>
            </div>
          </div>
          <div className="character-container">
            <img 
              src="/manus-storage/character_3f2cfc0e.jpg" 
              alt="캐릭터" 
              className="header-character" 
              style={{
                transform: selectedCompany || hoveredCompanyId ? `rotate(${getCharacterRotation()}deg)` : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            />
            {(selectedCompany || hoveredCompanyId) && (
              <div className="pointing-arrow" />
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 왼쪽 사이드바 */}
        <aside className="sidebar">
          {/* 검색 */}
          <div className="search-section">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="기업명, 업종 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* 지역 필터 */}
          <div className="filter-section">
            <h3 className="filter-title">지역 선택</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${selectedRegion === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('all')}
              >
                전체
              </button>
              <button
                className={`filter-btn ${selectedRegion === 'yeongdeungpo' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('yeongdeungpo')}
              >
                영등포구
              </button>
              <button
                className={`filter-btn ${selectedRegion === 'gangseo' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('gangseo')}
              >
                강서구
              </button>
              <button
                className={`filter-btn ${selectedRegion === 'yangcheon' ? 'active' : ''}`}
                onClick={() => setSelectedRegion('yangcheon')}
              >
                양천구
              </button>
            </div>
          </div>

          {/* 기업 목록 */}
          <div className="company-list-section">
            <h3 className="list-title">
              기업 목록 <span className="count-badge">{filteredCompanies.length}</span>
            </h3>
            <div className="company-list">
              {filteredCompanies.map(company => (
                <div
                  key={company.id}
                  className={`company-item ${selectedCompany?.id === company.id ? 'active' : ''} ${hoveredCompanyId === company.id ? 'hovered' : ''}`}
                  onClick={() => setSelectedCompany(company)}
                  onMouseEnter={() => handleCompanyHover(company)}
                  onMouseLeave={() => handleCompanyLeave(company)}
                >
                  <div className="company-item-header">
                    <h4 className="company-item-name">{company.name}</h4>
                    <span className="company-region-badge">{REGION_NAMES[company.region]}</span>
                  </div>
                  <p className="company-item-industry">{company.industry}</p>
                  <div className="company-item-meta">
                    <span className="meta-item">
                      <Users size={14} />
                      {company.employees}명
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 오른쪽 지도 */}
        <div className="map-section">
          <MapView onMapReady={handleMapReady} />
        </div>
      </div>

      {/* 상세 정보 모달 */}
      <CompanyDetailModal
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />
    </div>
  );
}
