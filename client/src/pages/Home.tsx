import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Building2, Users, Award, Briefcase, Home as HomeIcon } from 'lucide-react';
import { MapView } from '@/components/Map';
import { companies, REGION_NAMES, Company } from '@/data/companies';
import '../styles/home.css';

/**
 * 설계 철학: 현대적이고 전문적인 기업 홍보 포털
 * - 깔끔한 레이아웃과 명확한 정보 계층구조
 * - 구글 지도를 중심으로 한 시각적 탐색
 * - 검색과 필터를 통한 효율적인 기업 정보 접근
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
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(companies);
  const [mapReady, setMapReady] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

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

  // 지도에 마커 추가
  useEffect(() => {
    if (!map || !mapReady) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));

    // 새 마커 추가
    const newMarkers: google.maps.Marker[] = [];
    const infoWindows: google.maps.InfoWindow[] = [];

    filteredCompanies.forEach(company => {
      const marker = new google.maps.Marker({
        position: { lat: company.lat, lng: company.lng },
        map: map,
        title: company.name,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h4 style="margin: 0 0 5px 0; font-weight: bold;">${company.name}</h4>
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">${REGION_NAMES[company.region]}</p>
            <p style="margin: 0; font-size: 12px;">${company.industry}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        // 모든 인포윈도우 닫기
        infoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
        setSelectedCompany(company);
      });

      newMarkers.push(marker);
      infoWindows.push(infoWindow);
    });

    setMarkers(newMarkers);

    // 지도 범위 조정
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      // 패딩 추가 (사이드바 고려)
      const padding = { top: 50, right: 50, bottom: 50, left: 400 };
      map.fitBounds(bounds, padding);
    }
  }, [map, mapReady, filteredCompanies]);

  return (
    <div className="home-container">
      {/* 헤더 */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <Building2 className="logo-icon" />
            <div className="logo-text">
              <h1 className="site-title">우수 기업 홍보 포털</h1>
              <p className="site-subtitle">영등포구 · 강서구 · 양천구</p>
            </div>
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
                  className={`company-item ${selectedCompany?.id === company.id ? 'active' : ''}`}
                  onClick={() => setSelectedCompany(company)}
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
