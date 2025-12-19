import axios from "axios";

export const adminAxios = axios.create({
  baseURL: "http://localhost:8080", // 이미 프록시 쓰면 생략 가능
});
