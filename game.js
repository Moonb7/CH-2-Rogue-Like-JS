import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Character {
  constructor(hp, minAtt, maxAtt) {
    this.hp = hp;
    this.minAtt = minAtt;
    this.maxAtt = maxAtt;
    this.att;
  }

  attack(target) {
    this.att = Math.floor(Math.random() * (this.maxAtt - this.minAtt) + this.minAtt);
    target.hp -= this.att;
  }
}

class Player extends Character {
  Heal(amount, logs) {
    const randNum = Math.floor(Math.random() * amount);
    this.hp += randNum;
    logs.push(chalk.greenBright.bold(`체력이 ${randNum} 회복 되었습니다!`));
  }

  attack(target, logs, count) {
    this.att = Math.floor(Math.random() * (this.maxAtt - this.minAtt) + this.minAtt);
    target.hp -= this.att;
    logs.push(chalk.green(`[${count}] 몬스터에게 ${this.att}의 피해를 입혔습니다.`));
  }

  ClearReward() {
    const rand = Math.floor(Math.random() * 6);
    switch (rand) {
      case 0: // 최대 체력 배율로 증가시키기
        this.hp = this.hp;
        break;

      case 1: // 최소 공격력 배율로 증가시키기
        this.minAtt = this.minAtt;
        break;

      case 2: // 최대 공격력 배율로 증가시키기

        break;

      case 3: // 연속 공격확률업

        break;

      case 4: // 방어 확률업

        break;

      case 5: // 도망 확률업

        break;
    }
  }
}

class Monster extends Character {
  constructor(hp, minAtt, maxAtt, stage) {
    super(hp, minAtt, maxAtt);
    this.hp = hp + Math.floor(hp * 0.5 * stage);
    this.minAtt = Math.floor(minAtt + (minAtt * 0.5 * stage));
    this.maxAtt = Math.floor(maxAtt + (maxAtt * 0.5 * stage));
    this.stage = stage;
  }

  attack(target, logs, count) {
    this.att = Math.floor(Math.random() * (this.maxAtt - this.minAtt) + this.minAtt);
    target.hp -= this.att;
    logs.push(chalk.red(`[${count}] 몬스터가 ${this.att}의 피해를 입혔습니다.`));
  }
}


// 플레이어와 몬스터 정보 출력 함수
function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어 정보 HP : ${player.hp}, Attack : ${player.minAtt}-${player.maxAtt}`,
    ) +
    chalk.redBright(
      `| 몬스터 정보 HP : ${monster.hp}, Attack : ${monster.minAtt}-${monster.maxAtt}|`,
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

// 실제 배틀이 이루어지는 함수
const battle = async (stage, player, monster) => {
  let logs = [];
  let count = 0; // 행동한 횟수

  // 스테이지에 올라갈때마다
  if (stage > 1)
    player.Heal(20, logs);
  logs.push(chalk.magenta(`야생의 몬스터와 마추졌습니다!!\n`));

  while (player.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);
    logs.forEach((log) => console.log(log));

    // 몬스터가 죽으면 반복멈추기
    if (monster.hp <= 0) {
      await NextStageLoding(`스테이지 이동 중....`);
      break;
    }

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 도망친다`,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');
    switch (choice) {
      case '1': // 일반 공격
        count++;
        player.attack(monster, logs, count);
        if (monster.hp > 0) {
          monster.attack(player, logs, count);
        } else {
          logs.push(chalk.green(`[${count}] 몬스터를 처치했습니다.`));
        }
        break;
      case '2': // 도망
        count++;
        // logs.push(chalk.red(`[${count}] 도망가자~저멀리~`));
        // monster.hp = 0; // 몬스터를 0으로만들어 클리어 조건으로 완성
        await Escape(30, monster);
        break;
      default:
        logs.push(chalk.gray(`${choice}를 선택하셨습니다.`));
        logs.push(chalk.red(`올바른 선택을 하세요`));
    }
  }
};

// 확률의 성공여부를 확인하는 함수
function Probability(probability,) {
  const rand = Math.floor(Math.random() * 101); // 0 ~ 100까지수 추출
  if (rand <= probability) { // 정한 확률보다 작거나 같으면(확률범위에 들어오면) 성공
    console.log(chalk.greenBright(`확률에 성공하였습니다.`));
    return true;
  }
  console.log(chalk.greenBright(`확률에 실패했습니다.`));
  return false;
}

// 도망 함수
async function Escape(probability, monster) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      const result = Probability(probability);
      console.log(result);
      if (result) {
        monster.hp = 0;
      }
    }, 0);
  })
}

// 스테이지를 넘어가는 표현을 하기 위해 만든 함수
async function NextStageLoding(str) {
  console.log(chalk.green(str));
  return new Promise(function (resolve) {
    setTimeout(() => resolve("테스트"), 2000);
  });
}

// 게임을 시작하는 함수
export async function startGame() {
  console.clear();
  const player = new Player(100, 5, 20);
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(15, 2, 5, stage);
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    // 여기는 음 그런거 공격력, 체력, 방어력 올리는 보상 reward
    stage++;
  }
}