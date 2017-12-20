<?php
/**
 * 共享内存 + 信号量 实现原子操作
 */

// 创建该脚本粒度key
$ftoken = ftok(__FILE__, 't');

// 创建共享内存
$shmId = shmop_open($ftoken, 'c', 0655, 1024);

// 加入信号量
$signal = sem_get($ftoken);

/*
$size = shmop_write($shmId, 'hello Sujunjie', 0);
$size = shmop_write($shmId, 'Hello Sujunjie', 1);
$data = shmop_read($shmId, 1, 18);
var_dump($data);
*/

// 创建子进程
$arrChildren = array();
for ($i = 0; $i < 3; $i++) {
    $pid = pcntl_fork();
    // 子进程
    if ($pid == 0) {
        // 获取信号量
        sem_acquire($signal);

        // 注意，这里第一次得到的data为空，但长度为1
        $data = shmop_read($shmId, 0, 1);
        var_dump($data);
        if (intval($data) == 0) {
            $data = 1;
        } else {
            $data++;
        }

        // 随机sleep几秒
        $sec = rand(1, 3);
        sleep($sec);
        $size = shmop_write($shmId, $data, 0);

        // 释放信号量
        sem_release($signal);

        echo "Child process " . getmypid() . " is writing! now data is $data\n";
        exit( "child process " . getmypid() . " end!\n" );
    // fork子进程失败
    } else if ($pid == -1) {
        exit('fork fail!');   
    // 父进程
    } else {
        $arrChildren[$pid] = $pid;
    }
}

// 等待所有子进程都退出
while (!empty($arrChildren)) {
    $childPid = pcntl_wait($status);
    if ($childPid > 0){
        unset($arrChildren[$childPid]);
    }
}

// 删除共享内存
shmop_delete($shmId);
// 断开到共享内存的连接
shmop_close($shmId);
?>
