export class IdGenerator {
  private static randomId() {
    return Math.floor(10000 + Math.random() * 90000);
  }

  static itemId() {
    return 'BRG' + this.randomId();
  }
}
