import { Injectable } from '@nestjs/common';
import { Product } from '../types/product.type';
import { Review } from '../types/review.type';
import { Question } from '../types/question.type';

@Injectable()
export class ScraperService {
  private generateAuthorizationHeader(user: string, pass: string): string {
    const credentials = `${user}:${pass}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  async scrapeAndSave(asin: string, link: string): Promise<Product> {
    try {
      const user = 'U0000158137';
      const pass = 'PW121e323976168085a01aa0d8e12179a41';
      const base64Credentials = this.generateAuthorizationHeader(user, pass);

      let product: Product | null = null;
      let productImages: string[] | undefined = undefined;
      let reviews: Review[] | null = null;
      let questions: Question[] | null = null;

      const domainMatch = link.match(/amazon\.(\w+)/);
      const domain = domainMatch ? domainMatch[1] : null;

      try {
        const response: any = await fetch(
          'https://scraper-api.smartproxy.com/v2/scrape',
          {
            method: 'POST',
            body: JSON.stringify({
              target: 'amazon_product',
              parse: true,
              domain,
              query: `${asin}`,
            }),
            headers: {
              'Content-Type': 'application/json',
              Authorization: base64Credentials,
            },
          },
        );
        const data = await response.json();

        product = data.results[0].content.results;
        const { images } = product;
        productImages = images?.slice(1);
      } catch (error) {
        console.error(`Failed `, error);
      }

      if (!product) {
        throw new Error('Product not found');
      }

      reviews = await this.scrapeReviews(asin, base64Credentials, domain);
      questions = await this.scrapeQuestions(asin, base64Credentials, domain);
      console.log(product);
      return {
        title: product.title,
        description: product.description,
        bullet_points: product.bullet_points,
        price: product.price,
        image_url: product.images?.[0],
        images: productImages,
        rating: product.rating,
        reviews,
        questions,
      };
    } catch (error) {
      throw error;
    }
  }

  private async scrapeReviews(
    asin: string,
    credentials: string,
    mainDomain: string,
  ): Promise<Review[] | null> {
    try {
      const response: any = await fetch(
        'https://scraper-api.smartproxy.com/v2/scrape',
        {
          method: 'POST',
          body: JSON.stringify({
            target: 'amazon_reviews',
            parse: true,
            domain: mainDomain,
            query: `${asin}`,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: credentials,
          },
        },
      );

      const data = await response.json();

      const reviews: Review[] = data?.results?.[0]?.content?.results?.reviews;

      const filteredReviews = reviews
        ?.filter((item: Review) => item.rating === 5)
        .map((item) => {
          const { title, content, author, rating } = item;
          return { title, content, author, rating };
        })
        .slice(0, 5);

      return filteredReviews;
    } catch (error) {
      throw error;
    }
  }

  private async scrapeQuestions(
    asin: string,
    credentials: string,
    mainDomain: string,
  ): Promise<Question[]> {
    try {
      const response: any = await fetch(
        'https://scraper-api.smartproxy.com/v2/scrape',
        {
          method: 'POST',
          body: JSON.stringify({
            target: 'amazon_questions',
            parse: true,
            domain: mainDomain,
            query: `${asin}`,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: credentials,
          },
        },
      );

      const data = await response.json();

      const questions: Question[] =
        data?.results?.[0]?.content?.results?.questions;

      return questions
        ?.filter((question: Question) => question.answers.length !== 0)
        .slice(0, 4);
    } catch (error) {
      throw error;
    }
  }
}
