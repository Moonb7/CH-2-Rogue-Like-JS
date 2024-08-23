import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { start } from "./server.js";
import { AchievementPush } from "./server.js";

class Character {
  constructor(hp, minAtt) {
    this.hp = hp;
    this.attack_Multiplier = 1.5;
    this.minAtt = minAtt;
    this.maxAtt = Math.floor(this.minAtt * this.attack_Multiplier); // 최소 공격력에 일정 배율을 곱해주어 최대공격력을 구했습니다.
  }

  attack(target) {
  }
}

class Player extends Character {
  constructor(hp, minAtt, doubleAtk, defence, run) {
    super(hp, minAtt);
    this.doubleAtk = doubleAtk;
    this.defence = defence;
    this.run = run;
    // mp 추가
    this.mp = 2;
    // 업적 관련
    // 횟수
    this.Num_of_skill_uses = 0;
    this.Num_of_run_uses = 0;
  }
  Heal(amount, logs) {
    const randNum = Math.floor(Math.random() * amount);
    this.hp += randNum;
    logs.push(chalk.greenBright.bold(`체력이 ${randNum} 회복 되었습니다!`));
  }

  attack(target, logs, count) {
    let atk = Math.floor(Math.random() * (this.maxAtt - this.minAtt) + this.minAtt);
    target.hp -= atk;
    logs.push(chalk.green(`[${count}] 몬스터에게 ${atk}의 피해를 입혔습니다.`));
  }

  Defence(result, target, logs, count) {
    if (result) {
      const defenceAtk = Math.floor((Math.random() * (this.maxAtt - this.minAtt) + this.minAtt) * 0.6);
      target.hp -= defenceAtk;
      logs.push(chalk.cyanBright(`[${count}] 몬스터에게 ${defenceAtk}의 방어피해를 입혔습니다.`));
    } else {
      logs.push(chalk.gray(`[${count}] 몬스터에게 방어에 실패했습니다.`));
    }
  }

  async Skill_Fireball(target, logs, count) {
    this.mp--;
    this.Num_of_skill_uses++; // 사용횟수 체크
    AchievementFunc.SorcererAchievement(this);
    await LoadDelay(2000, `..점점 커지는 중..`);
    const skillAtk = Math.floor((Math.random() * (this.maxAtt - this.minAtt) + this.minAtt)) * 3; // 3배 공격
    target.hp -= skillAtk;
    logs.push(chalk.blueBright(`[${count}] 몬스터에게 ${skillAtk}의 마법피해를 입혔습니다.`));
  }

  ClearReward() {
    let str = "";
    let num = 0;

    let rand = Math.floor(Math.random() * 100 + 1);
    if (rand <= 20) { // 만약 20% 확률에 걸리면 마나획득
      num = 1;
      this.mp += num;
      str = `마나를 ${num}`;
    }
    else {
      rand = Math.floor(Math.random() * 6 + 1);
      switch (rand) {
        case 1: // 최대 체력 증가시키기        
          num = Math.floor(Math.random() * (50 - 20 + 1) + 20);
          this.hp += num;

          str = `체력이 ${num}`;
          break;

        case 2: // 최소 공격력 증가시키기
          num = Math.floor(Math.random() * (20 - 5 + 1) + 5);
          this.minAtt += num;
          this.maxAtt = Math.floor(this.minAtt * this.attack_Multiplier);

          str = `최소 공격력이 ${num}`;
          break;

        case 3: // 공격력 배율 증가시키기        
          const randomValue = Math.random() * (1 - 0.1) + 0.1;
          num = Math.round(randomValue * 100) / 100; // 소수점 2자리까지 구하기
          this.attack_Multiplier += num;
          this.maxAtt = Math.floor(this.minAtt * this.attack_Multiplier);

          str = `최대 공격력 배율이 ${num}`;
          break;

        case 4: // 연속 공격확률업        
          num = Math.floor(Math.random() * (7 - 3 + 1) + 3);
          this.doubleAtk += num;

          str = `연속 공격확률이 ${num}%`;
          break;

        case 5: // 방어 확률업
          num = Math.floor(Math.random() * (10 - 3 + 1) + 3);
          this.defence += num;

          str = `방어 확률이 ${num}%`;
          break;

        case 6: // 도망 확률업
          num = Math.floor(Math.random() * (3 - 1 + 1) + 1);
          this.run += num;

          str = `도망 확률이 ${num}%`;
          break;
      }
    }
    console.log(chalk.yellowBright(`${str} 증가했습니다.`));
  }
}

class Monster extends Character {
  constructor(hp, minAtt, stage) {
    super(hp, minAtt); // 부모로부터 먼저 데이터를 가져오고
    this.hp = hp * stage;
    this.minAtt = this.minAtt * stage;
    this.maxAtt = this.maxAtt * stage;
    this._stage = stage;
  }
  get stage() {
    return this._stage;
  }

  attack(target, logs, count) {
    if (this.hp > 0) {
      let atk = Math.floor(Math.random() * (this.maxAtt - this.minAtt) + this.minAtt);
      target.hp -= atk;
      logs.push(chalk.red(`[${count}] 몬스터가 ${atk}의 피해를 입혔습니다.`));
    } else {
      logs.push(chalk.bgBlue(`[${count}] 몬스터를 처치했습니다.`));
    }
  }
}

// 플레이어와 몬스터 정보 출력 함수
function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어 정보 HP : ${player.hp}, Attack : ${player.minAtt}-${player.maxAtt}, Mp : ${player.mp} `,
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
  let count = 0; // 행동한 횟수 음음
  let result = false; // 확률의 성공여부를 확인할 변수

  // 스테이지에 올라갈때마다
  if (stage > 1)
    player.Heal(20, logs);

  logs.push(chalk.magenta(`야생의 몬스터와 마추졌습니다!!\n`));

  let reLog = function () {
    console.clear();
    displayStatus(stage, player, monster);
    logs.forEach((log) => console.log(log));
  };

  while (player.hp > 0) {
    reLog();

    // 클리어 조건
    if (monster.hp <= 0)
      break;

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 연속 공격 (${player.doubleAtk}%) 3. 방어한다 (${player.defence}%) 4. 도망친다 (${player.run}%) 5. 스킬사용`,
      ),
    );

    let choice = readlineSync.question('당신의 선택은? ');
    switch (choice) {
      case '1': // 일반 공격
        count++;
        player.attack(monster, logs, count);

        monster.attack(player, logs, count);
        break;

      case '2': // 더블 공격
        count++;
        if (Probability(player.doubleAtk)) {
          logs.push(chalk.green(`[${count}] 연속공격에 성공했습니다.`));
          player.attack(monster, logs, count);
          player.attack(monster, logs, count);
        } else {
          logs.push(chalk.green(`[${count}] 연속공격에 실패했습니다.`));
        }

        monster.attack(player, logs, count);

        break;

      case '3': // 방어하기
        count++;
        result = Probability(player.defence);
        player.Defence(result, monster, logs, count);

        if (result === false) {
          monster.attack(player, logs, count);
        }
        break;

      case '4': // 도망가자-선우정아
        count++;
        logs.push(chalk.green(`[${count}] 도망을 시도합니다....`));
        reLog();
        result = Probability(player.run);
        await Escape(result, monster, logs, count, player);

        if (result === false) {
          monster.attack(player, logs, count);
        }
        break;

      case '5':
        if (player.mp <= 0) {
          await LoadDelay(500, chalk.gray(`마나가 부족합니다.`));
          break;
        }

        console.log(
          chalk.green(
            `\n1. 파이어볼`,
          ),
        );
        choice = readlineSync.question('스킬을 선택하세요 ');
        switch (choice) {
          case '1':
            count++;
            logs.push(chalk.green(`[${count}] 화염구를 만들기 시작했습니다!!`));
            reLog();
            await player.Skill_Fireball(monster, logs, count);
            monster.attack(player, logs, count);
            break;

          default:
            logs.push(chalk.gray(`${choice}를 선택하셨습니다.`));
            logs.push(chalk.red(`올바른 선택을 하세요`));
        }
        break;
      default:
        logs.push(chalk.gray(`${choice}를 선택하셨습니다.`));
        logs.push(chalk.red(`올바른 선택을 하세요`));
    }
  }
  reLog();
};


// 확률의 성공여부를 확인하는 함수
function Probability(probability) {
  const rand = Math.floor(Math.random() * 100) + 1; // 1 ~ 100까지수 추출
  if (rand <= probability) { // 정한 확률보다 작거나 같으면(확률범위에 들어오면) 성공
    return true;
  }
  return false;
}

// 도망 함수
async function Escape(result, monster, logs, count, player) {
  player.Num_of_run_uses++;
  AchievementFunc.RunAchievement(player);
  // 1초뒤에 스테이지 클리어 조건 실행
  return new Promise(function (resolve) {
    setTimeout(() => {
      result ? logs.push(chalk.bgBlue(`성공적으로 도망쳤습니다!!`)) : logs.push(chalk.gray(`[${count}] 도망에 실패 하였습니다.`));
      if (result) {
        monster.hp = 0;
      }
      resolve(result);
    }, 1500);
  })
}

// 딜레이 표현을 하기 위해 만든 함수
async function LoadDelay(Time, str = "") {
  console.log(str);
  return new Promise(function (resolve) {
    setTimeout(() => resolve(), Time);
  });
}

// 게임을 시작하는 함수
export async function startGame() {
  console.clear();
  const player = new Player(100, 5, 25, 55, 100);
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(30, 5, stage);
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    if (player.hp > 0) {
      stage++;
      player.ClearReward();
      AchievementFunc.StageClearAchievement(stage); // 스테이지 클리어시 업적달성
      await LoadDelay(2000, `${chalk.greenBright(`스테이지 이동 중....`)}`);
    } else {
      await LoadDelay(2000, `${chalk.bgRed(`플레이어가 죽었습니다...`)}`);
      break;
    }
  }
  console.clear();
  start();
}

// 업적 달성 조건을 보고 업적달성하는 함수
const AchievementFunc = {
  StageClearAchievement: async function (stage) {
    if (stage > 1 && stage <= 2) {
      AchievementPush('첫 스테이지 클리어', '1.', " 첫 스테이지 클리어")
    } else if (stage >= 11) {
      AchievementPush('킹 슬레이어', '2.', " 킹 슬레이어");
    }
  },
  SorcererAchievement: async function (player) {
    if (player.Num_of_skill_uses === 1) {
      AchievementPush('당신은 마법사?', '3.', " 당신은 마법사?");
    } else if (player.Num_of_skill_uses === 5) {
      AchievementPush('대마법사', '4.', " 대마법사");
    }
  },
  RunAchievement: async function (player) {
    if (player.Num_of_run_uses === 5) {
      AchievementPush('도망자', '5.', " 도망가자-선우정아");
    }
  }
}; 