import { getProduct } from "../api/product";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { addReview, getReviews, delReview, updateReview } from "../api/review";

const Div = styled.div`
  .product-info {
    display: flex;
    img {
      width: 50%;
      margin-right: 20px;
    }
    div {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
  .review-add {
    margin-top: 20px;

    input {
      margin-bottom: 10px;
    }
    textarea {
      resize: none;
      margin-bottom: 10px;
    }
    .review-contents {
      margin-top: 30px;
      .review-content {
        margin-top: 15px;
        img {
          width: 200px;
        }
        .btn-container {
          display: flex;
          justify-content: flex-end;

          button {
            margin-left: 5px;
          }
        }
      }
    }
  }
`;

const Detail = () => {
  const { code } = useParams();
  const [product, setProduct] = useState({});
  const [user, setUser] = useState({});
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [edit, setEdit] = useState(null);

  const info = useSelector((state) => {
    return state.user;
  });

  const productAPI = async () => {
    const response = await getProduct(code);
    setProduct(response.data);
  };

  const reviewsAPI = async () => {
    const response = await getReviews(code);
    setReviews(response.data);
  };

  // 처음만 실행되는 useEffect
  useEffect(() => {
    productAPI();
    reviewsAPI();
    if (Object.keys(info).length === 0) {
      setUser(JSON.parse(localStorage.getItem("user")));
    } else {
      setUser(info);
    }
  }, []);

  const reviewSubmit = async () => {
    // 이건 form 태그를 사용하지 않고 보낼때!
    const formData = new FormData();
    formData.append("id", user.id);
    formData.append("prodCode", code);
    formData.append("reviTitle", title);
    formData.append("reviDesc", desc);
    images.forEach((image, index) => {
      formData.append(`files[${index}]`, image);
    });
    await addReview(formData);
    setImages([]); // 얘는 문제 있음! css로 스타일링 하시면 사실 문제가 있는게 아니고
    // 비어지기 때문에! 이건 브라우저 보안상 문제 때문
    setTitle("");
    setDesc("");
    reviewsAPI();
  };

  const imageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const onDelete = async (code) => {
    await delReview(code);
    // 결과 즉시 출현
    reviewsAPI();
  };

  const onUpdate = async (review) => {
    setEdit(review);
  };

  const deleteImage = () => {
    setEdit((prev) => {
      const images = prev.images.filter((image) => image.reviImgCode !== code);
      return { ...prev, images: images };
    });
  };

  const cancel = () => {
    setEdit(null);
  };

  const reviewUpdate = async () => {
    const formData = new FormData();
    formData.append("reviTitle", edit.reviTitle);
    formData.append("reviDesc", edit.reviDesc);
    images.forEach((image, index) => {
      formData.append(`files[${index}]`, image);
    });
    formData.append("reviCode", edit.reviCode);
    formData.append("id", user.id);
    edit.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image.reviUrl);
    });
    // FormData 방식으로 전달
    // append로 필요한 값들 추가해야 하는 것
    // updateReview <formData 값 전달
    await updateReview(formData);
    // images 비울 것 edit 비울것
    setImages([]);
    setEdit(null);
    // review 다시 호출
    reviewsAPI();
  };

  return (
    <Div>
      <div className="product-info">
        <img src={product.prodPhoto?.replace("D:", "http://localhost:8081")} />
        <div>
          <h2>{product.prodName}</h2>
          <h3>{product.price}</h3>
        </div>
      </div>
      <div className="review-add">
        <Form.Control
          type="file"
          multiple
          accept="image/*"
          onChange={imageChange}
        />
        <Form.Control
          type="text"
          placeholder="제목 작성"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Form.Control
          as="textarea"
          placeholder="글 작성"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <Button variant="dark" onClick={reviewSubmit}>
          리뷰 작성
        </Button>
      </div>
      <div className="review-contents">
        {reviews.map((review) => (
          <div key={review.reviCode} className="review-content">
            {edit?.reviCode === review.reviCode ? (
              <>
                {edit.images.map((images) => (
                  <img
                    key={image.reviImgCode}
                    src={image.reviUrl.replace("D:", "http://localhost:8081")}
                    onClick={() => deleteImage(image.reviImgCode)}
                  />
                ))}
                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={imageChange}
                />
                <Form.Control
                  type="text"
                  value={edit.reviTitle}
                  onChange={(e) =>
                    setEdit((prev) => ({ ...prev, reviTitle: e.target.value }))
                  }
                />
                <Form.Control
                  as="textarea"
                  value={edit.reviDesc}
                  onChange={(e) =>
                    setEdit((prev) => ({ ...prev, reviDesc: e.target.value }))
                  }
                />
                <div className="btn-container">
                  <Button variant="warning" onClick={review}>
                    완료
                  </Button>
                  <Button variant="danger" onClick={cancel}>
                    취소
                  </Button>
                </div>
              </>
            ) : (
              <>
                {review.images?.map((image) => (
                  <img
                    key={image.reviImgCode}
                    src={image.reviUrl.replace("D:", "http://localhost:8081")}
                  />
                ))}
                <h4>{review.reviTitle}</h4>
                <p>{review.reviDesc}</p>
              </>
            )}

            <div className="btn-container">
              <Button
                variant="warning"
                onClick={() => onUpdate(review.reviCode)}
              >
                수정
              </Button>
              <Button
                variant="danger"
                onClick={() => onDelete(review.reviCode)}
              >
                삭제
              </Button>
              {/* 여기에 연결할 매서드 추가 reviCode를 매개변수로 보내는 것 까지 */}
            </div>
          </div>
        ))}
      </div>
    </Div>
  );
};
export default Detail;
