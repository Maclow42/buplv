"use server"

import prisma from "@/app/lib/prisma"

export const getArticleData = async (productId) => {
	const article = await prisma.article.findUnique({
		where: {
			id: parseInt(productId)
		},
	});

	return article;
}

export const validateBasket = async (basket) => {
	// set state of all article in basket to 2
	const articleIds = basket.map((article) => article.id);
	const articles = await prisma.article.updateMany({
		where: {
			id: {
				in: articleIds
			}
		},
		data: {
			state: 2
		}
	});
}