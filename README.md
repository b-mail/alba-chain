# Alba-Chain (알바체인)

VLM 기반 AI 온톨로지 올인원 알바 매니지먼트 SaaS

## 실행

```bash
npm install && npm run dev
```

## 화면 맵

### `/` — 역할 선택 (사장님 / 알바생)

### 사장님 · AI Agent
| 경로 | 유저플로우 |
|------|-----------|
| `/owner/agents/contract` | **근로계약서 Agent** — PDF 업로드→TXT→추출→DB / 줄글→생성→전송 |
| `/owner/agents/shift` | **대타·추가근무 Agent** — 증빙 VLM 검토 · 온톨로지 매핑 · 급여 승인 |

### 알바생
| 경로 | 기능 |
|------|------|
| `/worker/shift` | 대타 개인톡 증빙 → VLM → 급여 그래프 업데이트 |
| `/worker/pay` | 실수령 예측 (주휴·3.3%) · 시급 계산 · 계좌 변경 |
| `/worker/documents` | 근로계약서 등 자동 열람 |
| `/worker/todos` | 매장 할일 실시간 |
| `/worker/capture` | 캡처 보너스 |

온톨로지 체인: **근로계약 → 업무 → 근태 → 급여**
