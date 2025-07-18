import React from 'react';
import {Text, Box} from 'ink';
import Spinner from 'ink-spinner';

interface Props {
	text?: string;
	type?:
		| 'dots'
		| 'dots2'
		| 'dots3'
		| 'dots4'
		| 'dots5'
		| 'dots6'
		| 'dots7'
		| 'dots8'
		| 'dots9'
		| 'dots10'
		| 'dots11'
		| 'dots12'
		| 'line'
		| 'line2'
		| 'pipe'
		| 'simpleDots'
		| 'simpleDotsScrolling'
		| 'star'
		| 'star2'
		| 'flip'
		| 'hamburger'
		| 'growVertical'
		| 'growHorizontal'
		| 'balloon'
		| 'balloon2'
		| 'noise'
		| 'bounce'
		| 'boxBounce'
		| 'boxBounce2'
		| 'triangle'
		| 'arc'
		| 'circle'
		| 'squareCorners'
		| 'circleQuarters'
		| 'circleHalves'
		| 'squish'
		| 'toggle'
		| 'toggle2'
		| 'toggle3'
		| 'toggle4'
		| 'toggle5'
		| 'toggle6'
		| 'toggle7'
		| 'toggle8'
		| 'toggle9'
		| 'toggle10'
		| 'toggle11'
		| 'toggle12'
		| 'toggle13'
		| 'arrow'
		| 'arrow2'
		| 'arrow3'
		| 'bouncingBar'
		| 'bouncingBall'
		| 'smiley'
		| 'monkey'
		| 'hearts'
		| 'clock'
		| 'earth'
		| 'material'
		| 'moon'
		| 'runner'
		| 'pong'
		| 'shark'
		| 'dqpb'
		| 'weather'
		| 'christmas';
	color?:
		| 'black'
		| 'red'
		| 'green'
		| 'yellow'
		| 'blue'
		| 'magenta'
		| 'cyan'
		| 'white'
		| 'gray'
		| 'grey'
		| 'blackBright'
		| 'redBright'
		| 'greenBright'
		| 'yellowBright'
		| 'blueBright'
		| 'magentaBright'
		| 'cyanBright'
		| 'whiteBright';
}

export default function EnhancedSpinner({
	text = 'Loading...',
	type = 'dots',
	color = 'cyan',
}: Props) {
	return (
		<Box>
			<Text color={color}>
				<Spinner type={type} /> {text}
			</Text>
		</Box>
	);
}
