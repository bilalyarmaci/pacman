// Canvas ve context tanımlamaları
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Canvas büyüklük ayarı
canvas.width = innerWidth;
canvas.height = innerHeight;

// Oyuncuların ("Pacman"lerin) aşmayacakları sınırı oluşturmak için kullanılacak sınıf yapısı
class Boundary {
    // Nesne üretmeden ulaşılabilen genişlik ve yükseklik parametreleri
    static width = 40;
    static height = 40;
    constructor({ position }) {
        this.position = position;
        this.width = Boundary.width;
        this.height = Boundary.height;
    }
    // Nesneyi ekrana çizdiren metot
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

// Sınırları temsil eden harita.
// '-' sembolü sınırı oluşturan blok parçacığını (kare) temsil ediyor.
const map = [
    ['-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-']
]

// Sınırı oluşturan blok parçalarını tutan dizi, yani sınırın ta kendisi.
const boundaries = []

// Harita satırlarını tarar
// row = satır, i = mevcut satır numarası
map.forEach((row, i) => {
    row.forEach((symbol, j) => { // Satırdaki her elemanı karşılaştırmak için satır içi tarama
        // symbol = o anki indisteki (sütundaki) eleman, j = mevcut indis (sütun) numarası
        switch (symbol) {
            case '-':
                boundaries.push(new Boundary({  // '-' bulunması durumunda sınırı oluşturan diziye blok eklemesi yapılır. Halihazırdaki satır ve sütun değerleri dikkate alınarak pozisyon ataması yapılır.
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    }
                }));
                break;
        }
    })
})

// Diziyi gezinerek her bir elemanın ilgili metodu çağırır
boundaries.forEach(boundary => {
    boundary.draw();
})