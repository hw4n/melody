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
