package com.meeple.meeple_back.game.bluemarble.util;

import com.meeple.meeple_back.game.bluemarble.domain.CardType;
import com.meeple.meeple_back.game.bluemarble.domain.TelepathyCard;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;


/**
 * private int id;
 * private int number;
 * private String name;
 * private CardType type;
 * private String description;
 */
public class TelepathyCardParser implements ExcelReader<TelepathyCard> {
	private static final AtomicInteger counter = new AtomicInteger(100);

	@Override
	public List<TelepathyCard> readExcelFile() {
		List<TelepathyCard> cards = new ArrayList<>();

		try (InputStream fis = getClass().getResourceAsStream("/game-element/telepathy-cards.xlsx");
		     Workbook workbook = new XSSFWorkbook(fis)) {

			Sheet sheet = workbook.getSheetAt(0);
			Iterator<Row> rowIterator = sheet.iterator();

			// 첫 번째 행(헤더) 건너뛰기
			rowIterator.next();

			while (rowIterator.hasNext()) {
				Row row = rowIterator.next();
				int id = (int) row.getCell(0).getNumericCellValue();
				int number = (int) row.getCell(1).getNumericCellValue();
				String name = row.getCell(2).getStringCellValue();
				String description = row.getCell(3).getStringCellValue();
				// TODO : 텔레파시 3,7,10,11 만 남기기. (추후 지원되는 카드만 넣기)
				if (number == 3 || number == 7 || number == 10 || number == 11) {
					for (int i = 0; i < 7; i++) {
						int generatedId = counter.getAndIncrement();
						cards.add(new TelepathyCard(generatedId, number, name, CardType.TELEPATHY_CARD, description));
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return cards;

	}
}
