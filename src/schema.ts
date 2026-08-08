export interface User {
  id: number;
  username: string;
}

export interface Actor {
  id: number; // ID
  user_id: number | null; // users 칼럼과 연결하기 위함, 원격 액터는 NULL, 인스턴스 계정이라면 users.id
  uri: string; // 액터 ID(고유 URI)
  handle: string; // @johndoe@example.com 모양의 연합우주 핸들을 담는다
  name: string | null; // UI에 표시되는 이름을 담는다, 빌 수도 있다.
  inbox_url: string; // 수신함 URL
  shared_inbox_url: string | null; // 공유 수신함 URL11
  url: string | null; // 액터의 프로필 URL
  created: string; // 렠드가 생성된 시점
}

export interface Key {
  user_id: number;
  type: "RSASSA-PKCS1-v1_5" | "Ed25519";
  private_key: string;
  public_key: string;
  created: string;
}

