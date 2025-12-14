/* AUTO-GENERATED FILE. DO NOT EDIT. */
import * as React from 'react';

export type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string; title?: string };

import GlobalSvg from './global.svg';
import InstagramSvg from './instagram.svg';
import SearchSvg from './search.svg';
import YoutubeSvg from './youtube.svg';



export const IconGlobal: React.FC<IconProps> = ({ size = 20, title, ...rest }) => {
  return <GlobalSvg width={size} height={size} aria-hidden={title ? undefined : true} title={title} {...rest} />;
};


export const IconInstagram: React.FC<IconProps> = ({ size = 20, title, ...rest }) => {
  return <InstagramSvg width={size} height={size} aria-hidden={title ? undefined : true} title={title} {...rest} />;
};


export const IconSearch: React.FC<IconProps> = ({ size = 20, title, ...rest }) => {
  return <SearchSvg width={size} height={size} aria-hidden={title ? undefined : true} title={title} {...rest} />;
};


export const IconYoutube: React.FC<IconProps> = ({ size = 20, title, ...rest }) => {
  return <YoutubeSvg width={size} height={size} aria-hidden={title ? undefined : true} title={title} {...rest} />;
};
