function printInfo(subject,operation,result) {
  console.log(subject + ":" + operation + "<" + result + ">");
}

//提议者
var Proposer = function(){
  /**
  * 对于提案的约束，第三条约束要求：
  * 如果maxVote不存在，那么没有限制，下一次表决可以使用任意提案；
  * 否则，下一次表决要沿用maxVote的提案
  */
  this.nextProposal = function(currentVoteNumber,proposals) {
     var voteNumber = currentVoteNumber + 1;
     //提议列表为空时返回一个默认的提议
     //PROPOSALS[RANDOM.nextInt(PROPOSALS.length)]  默认内容
     if (proposals.length == 0)
         return new Proposal(voteNumber, Math.random()+"");
     //将提议列表排序后区值最大的提议
     //该提议为列表中比较后值得接受的提议
     Collections.sort(proposals);
     var maxVote = proposals.get(proposals.size() - 1);
     var maxVoteNumber = maxVote.getVoteNumber();
     var content = maxVote.getContent();
     //列表中最大的不能比当前的还大
     if (maxVoteNumber >= currentVoteNumber)
         console.log("投票贿赂的钱数错误");
     if (content != null)
         return new Proposal(voteNumber, content);
     else return new Proposal(voteNumber, Math.random()+"");
  }
  /**
   * 投票过程
   */
  this.vote = function(proposal/*object*/,acceptors/*array*/) {
  	  //quorum接受者的半数
      var quorum = Math.floor(acceptors.length, 2) + 1;
      var count = 0;
      while(true){
          count++;
          printInfo("VOTE_ROUND", "START", count);
          //创建一个新的提议列表，用于存储接受者返回的提议
          var proposals = [];
          //遍历每一个接受者得到每个接受者提出的提议
          for(var i=0; i<acceptors.length;i++){
            var acceptor = acceptors[i];
            var  promise = acceptor.onPrepare(proposal);
            if (promise != null && promise.isAck())
              proposals.add(promise.getProposal());
          }
          //如果返回的提议少于所有接受者的一半
          //为何要保证接受者返回的提议中最大的钱小于当前提议贿赂的钱
          //nextProposal
          if (proposals.length < quorum) {
              printInfo("PROPOSER[" + proposal + "]", "VOTE", "NOT PREPARED");
              proposal = this.nextProposal(proposal.getVoteNumber(), proposals);
              continue;
          }
          //检测是否同意该提议
          //onAccept
          var acceptCount = 0;
          for (var i = 0; i < acceptors.length ;i++) {
            var acceptor = acceptors[i];
            if (acceptor.onAccept(proposal))
              acceptCount++;
          }
          //如果相同提议的数量小于接受者数量的一半，进行下一次提议，重复上述所有步骤
          if (acceptCount < quorum) {
              printInfo("PROPOSER[" + proposal + "]", "VOTE", "NOT ACCEPTED");
              proposal = nextProposal(proposal.getVoteNumber(), proposals);
              continue;
          }
          break;
      }
      printInfo("PROPOSER[" + proposal + "]", "VOTE", "SUCCESS");
  }
}

var  Acceptor = function(){
     //上次表决结果
     var last = new Proposal();
     //每个接受者的姓名
     var name;
     this.Acceptor = function(name) {
       this.name = name;
     };
     //准备接收，返回一个答复对象
     this.onPrepare = function (proposal) {
       //假设这个过程有50%的几率失败
       if (Math.random() - 0.5 > 0) {
         printInfo("ACCEPTER_" + name, "PREPARE", "NO RESPONSE");
         return null;
       }
       //提议为空
       if (proposal == null){
         console.log("提议为空");
       }
       //如果这个提议的钱数大于上一个钱数则接受
       //返回 true的答复 ，把last置成新的提议
       if (proposal.getVoteNumber() > last.getVoteNumber()) {
           var response = new Promise(true, last);
           last = proposal;
           printInfo("ACCEPTER_" + name, "PREPARE"+ JSON.toJSONString(last), "OK");
           return response;
       } else {
         //给钱少了，不接受
         //返回一个false的答复
         printInfo("ACCEPTER_" + name, "PREPARE", "REJECTED");
         return new Promise(false, null);
       }
     }

     //比较上一个提议和这次发来的提议是否是一个
     //即  该提议是否已经被接受
     function onAccept( proposal) {
         //假设这个过程有50%的几率失败
         if (Math.random() - 0.5 > 0) {
             printInfo("ACCEPTER_" + name, "ACCEPT", "NO RESPONSE");
             return false;
         }
         printInfo("ACCEPTER_" + name, "ACCEPT", "OK");
         return last.equals(proposal);
     }
}

//答复
var Promise = function(){
  //回复，提议
  var ack;
  var proposal;

  this.Promise = function ( ack, proposal) {
    this.ack = ack;
    this.proposal = proposal;
  }

  this.isAck = function () {
    return ack;
  }

  this.getProposal = function () {
    return proposal;
  }
}

//投票
var Proposal = function (){
   //投票数相当于贿赂的钱，投票提议内容content
   var voteNumber;
   var content;

   this.Proposal = function(voteNumber,  content) {
       this.voteNumber = voteNumber;
       this.content = content;
   }

   this.setVoteNumber = function( voteNumber) {
       this.voteNumber = voteNumber;
   }

   this.setContent = function( content) {
       this.content = content;
   }

   this.getVoteNumber = function() {
       return this.voteNumber;
   }

   this.getContent = function() {
       return this.content;
   }

   //重写toString
   this.toString = function(){
       return this.voteNumber + ":" + this.content;
   }
}

var acceptors = [];
var ns = ["A", "B", "C", "D", "E"];
for(var i=0;i<ns.length;i++ ){
  var name = ns[i];
  acceptors.push(new Acceptor(name))
}
var pro = new Proposer();
pro.vote(new Proposal(1, null), acceptors);
