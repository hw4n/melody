## Writable 정리에 대하여

Writable 객체를 정리하지 않으면 언젠간 메모리가 낭비되어 프로그램이 종료될 것이다.

이 문단은 Writable 객체를 어떤 조건으로 정리할 것인지의 계획과 연구를 문서화한 것이다.

클라이언트에게 할당되는 PassThrough Object는 스트리밍을 받고 있을때와, 스트리밍이 종료되었을 때의 차이점을 몇가지 발견하였다.

``in-progress.json``
```
ReadableState {
  flowing: true,
  reading: false,
  readingMore: true,
}
```
``disconnected.json``
```
ReadableState {
  flowing: false,
  reading: true,
  readingMore: false,
}
```
처럼 서로 상반된 결과를 나타내었다.

기존에는 이 부분에서 pipe의 길이가 0인지를 확인하여 (ReadableState.pipe.length) 스트리밍을 종료하는 방식을 사용하였으나 때때로 끊김이 확인되었기 때문에 위의 방법을 사용해 볼 것이다.

### 결론

굳이 어렵게 생각 안해도 되는 것 같다. 매핑한 소켓 아이디를 이용하여 객체를 지운다.

```js
delete writables[socket.id];
```

또한 소켓 타임아웃 시간을 늘려주는 것으로 조금은 더 끊기지 않게 되었다.

```js
const io = require("socket.io")(server, {
  pingTimeout: 1000 * 60 * 5,
  pingInterval: 1000 * 10,
  cors: {
    origin: "*"
  }
});
```

모바일 환경에서는 배터리를 낭비하지 않기 위하여 사용하지 않는 경우에는 운영체제 차원에서 소켓이 정리되므로, 크게 고민할 필요는 없을 듯.
