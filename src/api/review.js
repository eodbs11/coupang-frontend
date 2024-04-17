import axios from "axios";

const token = localStorage.getItem("token");

// 인증이 필요없는 RESTful API 가져올때 기본 루트
const instance = axios.create({
  baseURL: "http://localhost:8080/api/public/",
});

// 인증이 필요한 RESTful API 가져올때 기본 루트
const authorize = axios.create({
  baseURL: "http://localhost:8080/api/",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// [POST] http://localhost:8080/api/review
// 인증 필요, RequestBody 데이터 보내야 되는 상황
export const addReview = async (data) => {
  return await authorize.post("review", data);
};

// [GET] http://localhost:8080/api/public/product/10/review
// 인증 필요 X, 경로에 상품 코드 보내야 되는 상황
export const getReviews = async (code) => {
  return await instance.get("product/" + code + "/review");
};