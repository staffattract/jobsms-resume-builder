/** Parsed Employment Alert API job row (`<JOB>`). */
export type JobListing = {
  externalJobId: string;
  title: string;
  company: string;
  description: string;
  url: string;
  location: string;
  state: string;
  country: string;
  category: string;
  categoryId: string;
  created_date?: string;
  logo?: string;
};

export type JobsSearchMeta = {
  totaljobs?: string;
  keyword?: string;
  location?: string;
  city?: string;
  state?: string;
};
