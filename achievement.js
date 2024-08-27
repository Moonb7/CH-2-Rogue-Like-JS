import chalk from 'chalk';
import readlineSync from 'readline-sync';

const achievement = [];

// 업적창을 띄어주는 함수입니다.
export async function chllengeSuccessDisplay() {
    console.clear();
    console.log(chalk.bgRedBright('===================달성 업적===================\n'));
    achievement.sort();
    achievement.forEach((log) => console.log(log));

    console.log(chalk.yellow('\n메인 메뉴로 돌아가기 1을 입력하세요...'));
    const choice = readlineSync.question('입력: ');
    switch (choice) {
        case '1':
            console.clear();
            break;
        default:
            await loadDelay(600, chalk.gray(`올바른 값을 입력해주세요.`));
            await chllengeSuccessDisplay(); // 유효하지 않은 입력일 경우 다시 입력 받음
    }
}

// 업적 추가 함수
function achievementPush(str, achievementNum, achievementStr) {
    if (achievement.includes(chalk.magenta(achievementNum) + achievementStr) === false) {
        console.log(chalk.bgGray(`\n업적 : ${str}\n`));
        achievement.push(chalk.magenta(achievementNum) + achievementStr);
    }
}

// 업적 달성 조건을 보고 업적달성하는 함수
export const achievementFunc = {
    stageClearAchievement: async function (stage) {
      if (stage > 1 && stage <= 2) {
        achievementPush('첫 스테이지 클리어', '1.', " 첫 스테이지 클리어")
      } else if (stage >= 11) {
        achievementPush('킹 슬레이어', '2.', " 킹 슬레이어");
      }
    },
    sorcererAchievement: async function (player) {
      if (player.Num_of_skill_uses === 1) {
        achievementPush('당신은 마법사?', '3.', " 당신은 마법사?");
      } else if (player.Num_of_skill_uses === 5) {
        achievementPush('대마법사', '4.', " 대마법사");
      }
    },
    runAchievement: async function (player) {
      if (player.Num_of_run_uses === 5) {
        achievementPush('도망자', '5.', " 도망가자-선우정아");
      }
    }
  }; 

// 딜레이 표현을 하기 위해 만든 함수
async function loadDelay(Time, str = "") {
    console.log(str);
    return new Promise(function (resolve) {
      setTimeout(() => resolve(), Time);
    });
  }