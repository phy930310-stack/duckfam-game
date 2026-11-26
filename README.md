# 덕팸 게임

친구 셋이 취미로 같이 만드는 게임의 공용 저장소입니다.

## 바로 열어 보기

| 버전 | 주소 |
|---|---|
| 기준 버전 | https://phy930310-stack.github.io/duckfam-game/ |
| 덕운 실험판 | https://phy930310-stack.github.io/duckfam-game/deokun/ |
| 현용 실험판 | https://phy930310-stack.github.io/duckfam-game/hyunyong/ |
| 정재 실험판 | https://phy930310-stack.github.io/duckfam-game/jeongjae/ |

올리고 나서 1~2분 뒤에 반영됩니다. 안 바뀌어 보이면 새로고침하세요.

## 폴더

```
index.html           기준 버전 (합의된 것만 들어갑니다)
deokun/index.html    덕운 실험판
hyunyong/index.html  현용 실험판
jeongjae/index.html  정재 실험판
```

## 작업 규칙

1. **자기 폴더만 고칩니다.** 다른 사람 폴더와 기준 버전(맨 위 `index.html`)은 건드리지 않습니다.
2. **자주 올립니다.** 올려야 다른 사람이 볼 수 있습니다. 완성되지 않아도 괜찮습니다.
3. **올릴 때 한 줄로 무엇을 바꿨는지 적습니다.** 예: `주점에 영웅 고용 추가`
4. **기준 버전에 넣을 것은 같이 정합니다.** 주 1회 정도 서로의 실험판을 보고, 넣기로 한 것만 기준 버전으로 옮깁니다.
5. **본명, 연락처, 비밀번호는 올리지 않습니다.** 이 저장소는 누구나 볼 수 있습니다.

## 올리는 방법

### GitHub 웹에서 (깃을 몰라도 됩니다)

1. 이 저장소에서 자기 폴더로 들어갑니다. 예: `hyunyong`
2. 오른쪽 위 **Add file → Upload files** 를 누릅니다.
3. 새 `index.html`을 끌어다 놓습니다. 파일 이름은 반드시 `index.html`이어야 합니다.
4. 아래 칸에 무엇을 바꿨는지 한 줄 적고 **Commit changes** 를 누릅니다.

### Claude Code에서

세션에 이 저장소를 연결한 뒤, "내 폴더(`hyunyong/`)의 index.html을 고쳐서 올려 줘"라고 하면 됩니다.

## 현용 실험판의 도트 전투 무대

`hyunyong/` 폴더는 HTML 한 장이 아니라 파일 여러 개로 되어 있습니다.

- `hyunyong/index.html` 게임 본체 (덕운 기준 버전 + 전투 무대 연결 몇 줄)
- `hyunyong/battlefx.js` 자동 전투에서 일어난 일을 도트 이펙트로 보여 주는 코드
- `hyunyong/pixelfx/` 도트 이펙트 라이브러리 [pixelfx](https://github.com/patch-gg/pixelfx) (MIT)의 일부를 복사한 것. 라이선스는 폴더 안 `LICENSE`, `NOTICE.md` 참고

`battlefx.js`가 없어도 게임은 그대로 돌아갑니다. 파일을 직접 더블클릭해서 열면 브라우저 보안 규칙 때문에 무대만 비어 보이니, 위의 주소로 열어 주세요.

## 기준 버전에 대해

지금 기준 버전은 덕운이 만든 「영주와 용사들: 영토 확장기」입니다. 세 폴더는 모두 같은 파일에서 출발합니다.
