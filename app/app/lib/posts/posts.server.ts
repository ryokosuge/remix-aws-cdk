import { Post } from "./types";

export const getPosts = async () => {
  const res = await fetch(
    "https://61fc7b6d3f1e34001792c8ca.mockapi.io/api/v1/posts",
  );
  const json = await res.json();
  console.log(json);
  return json as Post[];
};

export const getPost = async (id: string) => {
  const res = await fetch(
    `https://61fc7b6d3f1e34001792c8ca.mockapi.io/api/v1/posts/${id}`,
  );
  const json = await res.json();
  return json as Post;
};
