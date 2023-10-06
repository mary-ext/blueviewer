import type { JSXNode } from '@intrnl/jsx-to-string';

export interface DocumentProps {
	title?: string;
	page?: string;
	children?: JSXNode;
	head?: JSXNode;
}

const Document = ({ title, page, children, head }: DocumentProps) => {
	const className = 'page' + (page ? ` ${page}-page` : '');

	return (
		<html>
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width" />
				<title>{title || 'Blueviewer'}</title>
				<link rel="stylesheet" href="/assets/styles.css" />
				{head}
			</head>
			<body>
				<div class={className}>{children}</div>
			</body>
		</html>
	);
};

export default Document;
