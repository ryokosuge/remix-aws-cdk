import path from "path";
import fs from "fs/promises";
import parseFrontMatter from "front-matter";
import invariant from "tiny-invariant";
import { marked } from "marked";

export type Post = {
  slug: string;
  html: string;
  title: string;
};

export type PostMarkdownAttributes = {
  title: string;
}

function isValidPostAttributes(
  attributes: any
): attributes is PostMarkdownAttributes {
  return attributes?.title;
}

export async function getPost(slug: string) {
  const res = await fetch(`http://192.168.0.75:3000/res/posts/${slug}.md`);
  const text = await res.text();
  const { attributes, body } = parseFrontMatter<PostMarkdownAttributes>(text);
  invariant(
    isValidPostAttributes(attributes),
    `Post ${slug} is missing attributes`
  )
  const html = marked(body);
  return { slug, html, title: attributes.title };
};

export async function getPosts() {
  const res = await fetch("http://192.168.0.75:3000/res/posts.json");
  return res.json();
}
