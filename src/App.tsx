import {
  Button,
  ChakraProvider,
  Circle,
  Flex,
  HStack,
  Heading,
  Stack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import useMethods from 'use-methods';
import { DAY_1 } from './constants';
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import { useState } from 'react';

export type Group = {
  category: string;
  letter: string;
  items: string[];
  difficulty: 1 | 2 | 3 | 4;
};

type Options = {
  groups: Group[];
};

type State = {
  complete: Group[];
  incomplete: Group[];
  items: string[];
  activeItems: string[];
  mistakesRemaining: number;
  isVictory: boolean;
};

const difficultyColor = (difficulty: 1 | 2 | 3 | 4): string => {
  return {
    1: '#fbd400',
    2: '#b5e352',
    3: '#729eeb',
    4: '#bc70c4',
  }[difficulty];
};

const chunk = <T,>(list: T[], size: number): T[][] => {
  const chunkCount = Math.ceil(list.length / size);
  return new Array(chunkCount).fill(null).map((_c: null, i: number) => {
    return list.slice(i * size, i * size + size);
  });
};

const shuffle = <T,>(list: T[]): T[] => {
  return list.sort(() => 0.5 - Math.random());
};

const methods = (state: State) => {
  return {
    toggleActive(item: string) {
      if (state.activeItems.includes(item)) {
        state.activeItems = state.activeItems.filter((i) => i !== item);
      } else if (state.activeItems.length < 4) {
        state.activeItems.push(item);
      }
    },

    shuffle() {
      shuffle(state.items);
    },

    deselectAll() {
      state.activeItems = [];
    },

    submit() {
      const foundGroup = state.incomplete.find((group) =>
        group.items.every((item) => state.activeItems.includes(item)),
      );

      if (foundGroup) {
        state.complete.push(foundGroup);
        const incomplete = state.incomplete.filter((group) => group !== foundGroup);
        state.incomplete = incomplete;
        state.items = incomplete.flatMap((group) => group.items);
        shuffle(state.items);
        state.activeItems = [];

        // Check for victory condition
        if (state.items.length === 0) {
          // Register victory
          state.isVictory = true;
          console.log(state.isVictory);
        }

      } else {
        state.mistakesRemaining -= 1;
        state.activeItems = [];

        if (state.mistakesRemaining === 0) {
          state.complete = [...state.incomplete];
          state.incomplete = [];
          state.items = [];
        }
      }
    },
  };
};

const useGame = (options: Options) => {
  
  const initialState: State = {
    incomplete: options.groups,
    complete: [],
    items: shuffle(options.groups.flatMap((g) => g.items)),
    activeItems: [],
    mistakesRemaining: 4,
    isVictory: false, 
  };

  const [state, fns] = useMethods(methods, initialState);

  return {
    ...state,
    ...fns,
  };
};

export const App = () => {
  const [fireworksTriggered, setFireworksTriggered] = useState(false);

  const handleYesButtonClick = () => {
    // Trigger fireworks
    setFireworksTriggered(true);
  };
  
  const game = useGame({
    groups: DAY_1,
  });

  const {onClose} = useDisclosure()

  return (
    <ChakraProvider>
      <Flex h="100vh" w="100vw" align="center" justify="center">
        <Stack spacing={4} align="center">
          <Heading size="3xl" fontFamily="Georgia" fontWeight="light">
            (Our) Connections 😁
          </Heading>
          <Text fontWeight="bold">Create four groups of four!</Text>
          <Stack>
            {game.complete.map((group) => (
              <Stack
                spacing={1}
                lineHeight={1}
                rounded="lg"
                align="center"
                justify="center"
                h="80px"
                w="624px"
                bg={difficultyColor(group.difficulty)}
              >
                <Text fontSize="xl" fontWeight="extrabold" textTransform="uppercase">
                  {group.letter}
                </Text>
                <Text fontSize="lg" fontWeight="bold" textTransform="uppercase">
                  {group.category}
                </Text>
                <Text fontSize="sm" textTransform="uppercase">
                  {group.items.join(', ')}
                </Text>
              </Stack>
            ))}

            {chunk(game.items, 4).map((row) => (
              <>
                <HStack>
                  {row.map((item) => (
                    <Button
                      w="150px"
                      h="80px"
                      bg="#efefe6"
                      fontSize="16px"
                      fontWeight="extrabold"
                      textTransform="uppercase"
                      onClick={() => game.toggleActive(item)}
                      isActive={game.activeItems.includes(item)}
                      _active={{
                        bg: '#5a594e',
                        color: 'white',
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                </HStack>
              </>
            ))}
          </Stack>
          <HStack align="baseline">
            <Text>Mistakes remaining:</Text>
            {[...Array(game.mistakesRemaining).keys()].map(() => (
              <Circle bg="gray.800" size="12px" />
            ))}
          </HStack>
          <HStack>
            <Button
              colorScheme="black"
              variant="outline"
              rounded="full"
              borderWidth="2px"
              onClick={game.shuffle}
            >
              Shuffle
            </Button>
            <Button
              colorScheme="black"
              variant="outline"
              rounded="full"
              borderWidth="2px"
              onClick={game.deselectAll}
            >
              Deselect All
            </Button>
            <Button
              colorScheme="black"
              variant="outline"
              rounded="full"
              borderWidth="2px"
              isDisabled={game.activeItems.length !== 4}
              onClick={game.submit}
            >
              Submit
            </Button>
          </HStack>

          <Modal
            isCentered
            onClose={onClose} // Close the modal when clicked on the overlay or the close button
            isOpen={game.isVictory} // Show modal only when isVictory is true
            motionPreset='slideInBottom'
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader textAlign="center">Great!</ModalHeader>
              <ModalBody>
                {/* Stacked containers */}
                <Stack spacing={4}>
                  {DAY_1.map((group, index) => (
                    <Stack
                      key={index}
                      spacing={1}
                      lineHeight={1}
                      rounded="lg"
                      align="center"
                      justify="center"
                      h="40px"
                      w="400px"
                      bg={difficultyColor(group.difficulty)}
                    >
                      <Text fontSize="xl" fontWeight="extrabold" textTransform="uppercase">
                        {group.letter}
                      </Text>
                    </Stack>
                  ))}
                </Stack>
               
                <Text fontSize="xl" fontWeight="extrabold" textTransform="uppercase" textAlign="center" lineHeight="50px">
                ?
                </Text>
              </ModalBody>
              <ModalFooter justifyContent="center">
                <Button colorScheme='green' onClick={handleYesButtonClick}>YES</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          {fireworksTriggered && <Fireworks autorun={{ speed: 3}}/>}
        </Stack>
      </Flex>
    </ChakraProvider>
  );
};