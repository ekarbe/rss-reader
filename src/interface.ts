export interface IFeed {
    title?: string;
    entries?: Array<IEntry>;
}

export interface IEntry {
    title: string;
    link?: string;
    date?: Date;
}

export interface IFeedConfig {
	title: string;
	url: string;
	id?: number;
}